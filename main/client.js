/* Copyright (c) EvoDev Team, Inc - All Rights Reserved.
 * This work is licensed under the Recex Shared Source License Version 1.0. 
 * To view a copy of this license, visit https://raw.githubusercontent.com/Recex/Licenses/master/SharedSourceLicense/LICENSE.txt.
 * Written by Gaia <careday17@gmail.com>, October 2020.
 */

let uid = require("cuid");

const em = new (require("@evodev/eventemitter"));
const emitEvent = em.emit.bind(em);
const getEvent = em.get.bind(em);
const offEvent = em.off.bind(em);
const onEvent = (n,c,o) => {
  if (o) return em.once.bind(em)(n,c);
  else return em.on.bind(em)(n,c);
};

class Client {
  constructor(config) {
    if (!config) return errConn(400);
    if ((!config.url && !config.ip) || !config.account) return errConn(400);
    if (!config.account.username || !config.account.password) return errConn(400);
    this.connection = {
      url : config.url || config.ip,
      path: config.path,
      account: {
        username: config.account.username,
        password: config.account.password
      },
      events: {}
    };
  }
  register() {
    if (this.socket1) throw new Error("Please wait until the account is registered.");
    this.socket1     = require("socket.io-client")(this.connection.url);
    this.socket1.once("res.register", (res) => {
      this.socket1.disconnect();
      delete this.socket1;
      if (res === 101) return emitEvent("registered");
	  else if (res === 402) return emitEvent("alreadyRegistered");
	  else if (typeof res === "object") if (res.error === 407) throw new Error(res.reason);
    });
    this.socket1.emit("register", this.connection.account);
  }
  connect() {
    if (this.socket) throw new Error("You only can do connect once!");
    this.socket      = require("socket.io-client")(this.connection.url);
    this.socket.on("connect", (() => {
      this.socket.once("res.auth", (res) => {
        if (res < 500 && res > 399 && typeof res !== "object") throw new Error(translate(res));
		else if (typeof res === "object") if (res.error === 407) throw new Error(res.reason);
        emitEvent("connected");
		this.socket.once("disconnect", () => {
		  emitEvent("disconnected");
		});
      });
      this.socket.emit("auth", this.connection.account);
    }).bind(this));
  }
  on(name, callback) {
	return onEvent(name, callback, false);
  }
  once(name, callback) {
	return onEvent(name, callback, true);
  }
  off(id) {
	return offEvent(id);
  }
  set(name, value, callback) {
    if (!this.socket) throw new Error("Try to connect first!");
    let id = uid();
    this.socket.emit("set", { key: name, value: value, id: id });
    if (typeof callback !== "function") return new Promise((resolve, reject) => {
      this.socket.once(`res.set.${id}`, (res) => {
        if (!isNaN(res)) if (res < 500 && res > 399) return reject(translate(res));
        resolve(res);
      });
    });
	else {
		this.socket.once(`res.set.${id}`, (res) => {
			if (!isNaN(res)) if (res < 500 && res > 399) return callback(translate(res));
			callback(undefined, res);
		});
	}
  }
  get(name, callback) {
    if (!this.socket) throw new Error("Try to connect first!");
    let id = uid();
    this.socket.emit("get", { key: name, id: id });
    if (typeof callback !== "function") return new Promise((resolve, reject) => {
      this.socket.once(`res.get.${id}`, (res) => {
        if (!isNaN(res)) if (res < 500 && res > 399) return reject(translate(res));
        resolve(res);
      });
    });
	else {
		this.socket.once(`res.get.${id}`, (res) => {
			if (!isNaN(res)) if (res < 500 && res > 399) return callback(translate(res));
			callback(undefined, res);
		});
	}
  }
}

function translate(code) {
  switch(code) {
    case 100:
      return "Connected.";
      break;
    case 101:
      return "Successfully to made the account.";
      break;
    case 400:
      return "Invalid config connection object.";
      break;
    case 401:
      return "Failed to connect to the server.";
      break;
    case 402:
      return "Invalid username.";
      break;
    case 403:
      return "Invalid password.";
      break;
    case 404:
      return "Please specify key!";
      break;
    case 405:
      return "Please specify value!";
      break;
    case 406:
      return "Key can only be a string!";
      break;
    default:
      return "Invalid Response Code. Please update this package!";
      break;
  }
}

function errConn(code) {
  throw new Error(translate(code));
}

module.exports = Client;

/* Copyright (c) EvoDev Team, Inc - All Rights Reserved.
 * This work is licensed under the Recex Shared Source License Version 1.0. 
 * To view a copy of this license, visit https://raw.githubusercontent.com/Recex/Licenses/master/SharedSourceLicense/LICENSE.txt.
 * Written by Gaia <careday17@gmail.com>, October 2020.
 */