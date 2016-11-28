"use strict";

// Object destructuring
const {STATE, STATUS} = require('./consts');

// Class
class Client {
	// Destructuring
	constructor(options = {}) {
		this.arr = [10, 50, 0];
		this.foo = 5;

		this.path = '{{envPath}}';

		this.info(`${process.env.NODE_ENV} ${STATE} ${this.path}`);

		// Arrow Functions
		this.info(this.arr.reduce((a, b) => a + b, 0));
		// Lexical this
		this.arr.forEach((i) => {
			this.info(i * this.foo);
		});
	}

	info(message = '') {
		// Template Literals
		console.info(`${Date.now()}: ${message}`);
	}

	// Rest operator (...)
	wait(a, ...args) {
		this.info(a, args);
	}
};

module.exports = Client;