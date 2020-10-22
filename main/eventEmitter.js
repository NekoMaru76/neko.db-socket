/* Copyright (c) EvoDev Team, Inc - All Rights Reserved.
 * This work is licensed under the Recex Shared Source License Version 1.0. 
 * To view a copy of this license, visit https://raw.githubusercontent.com/Recex/Licenses/master/SharedSourceLicense/LICENSE.txt.
 * Written by Gaia <careday17@gmail.com>, October 2020.
 */

function offEvent(id) {
  if (typeof id !== "string") throw new Error(`ID must be a string.`);
  for (let [key,val] of Object.entries(this.events)) {
    for (let arr of val) {
	  if (arr.id === id) arr = undefined;
	}
	val = val.filter(v => v ? true : false);
  }
}

function onEvent(name, callback, type, id) {
  if (!this.events[name]) this.events[name] = [];
  this.events[name].push({
    once: type,
	callback: callback,
	type: type,
	id: id
  });
}

function emitEvent(name) {
  let callbacks = getEvent.bind(this)(name);
  if (!Array.isArray(callbacks)) return;
  let args = [...arguments].slice(1);
  callbacks.forEach(obj => {
    obj.callback(...args);
    if (obj.once) obj = null;
  });
  callbacks = callbacks.filter(c => {
    return c ? true : false;
  });
}

function getEvent(name) {
  if (typeof name !== "string") throw new Error("Name (of an event) arguments must be a string");
  let e = this.events[name];
  if (!Array.isArray(e)) return null;
  return e;
}

module.exports = {
  emitEvent: emitEvent,
  getEvent : getEvent,
  offEvent : offEvent,
  onEvent  : onEvent
};

/* Copyright (c) EvoDev Team, Inc - All Rights Reserved.
 * This work is licensed under the Recex Shared Source License Version 1.0. 
 * To view a copy of this license, visit https://raw.githubusercontent.com/Recex/Licenses/master/SharedSourceLicense/LICENSE.txt.
 * Written by Gaia <careday17@gmail.com>, October 2020.
 */