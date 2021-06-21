/******************************************************************************
 *
 * MIT License
 *
 * Copyright (c) 2021 Benjamin Collins benjamin@collins.moe
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *****************************************************************************/


"use strict";

const http = require('http');

/**
 * BLOCK 1 : Set up Wallet
 **/

const params = {
	daemonHost : "127.0.0.1",
	daemonPort : 11898,
	filename : "turtle.wallet",
	password : "raspberry"
}

init();
async function init() {
	console.log('Setting up the default wallet!');
	await httpPost('/wallet/create', params);
	await httpDel('/wallet');
	console.log('Opening up the default wallet');
	await httpPost('/wallet/open', params);
};

/**
 * BLOCK 2 : Export Modules
 **/

module.exports = {
	
	prepare : function(body) {

		let url = '/transactions/prepare/advanced';

		let model = {
			destinations : [
				{
					address : body.to_address,
					amount : body.amount
				}
			],
			sourceAddresses : [ body.from_address ]
		}

		return httpPost(url, model);

	},

	cancel : function( hash ) {

		let url = '/transactions/prepared/${hash}';
		return httpDel(url);

	}, 

	send : function(hash) {

		let url = '/transactions/send/prepared';

		console.log("Send URL: %s", url);

		let model = {
			transactionHash : hash
		}
		
		console.log(model);

		return httpPost(url, model);

	},

	getBalance : function(addr) {
		
		let url = `/balance/${addr}`;
		return httpGet(url);
		
	},
	
	createAddress : function() {
		
		let url = '/addresses/create';
		return httpPost(url);
		
	}

}

/**
 * BLOCK 2 : Set Up Http Request Functions
 **/
 
function httpGet(url) {

	return new Promise( function(resolve, reject) {

		const post_options = {
			host: '127.0.0.1',
			port: '8070',
			path: url,
			method: 'GET',
			headers: {
				'X-API-KEY' : 'raspberry',
				'accept' : 'application/json'
			}
		};

		let post_req = http.request(post_options, function(res) {
			res.setEncoding('utf8');
			let data = '';
			res.on('data', function (chunk) {
				if(chunk) {
					data += chunk;
				}
			});
			res.on('end', function() {
				if(data.length) {
					resolve(JSON.parse(data));
				} else {
					resolve(null);
				}
			});
		});

		post_req.end();

	});

}


function httpDel(url) {

	return new Promise( function(resolve, reject) {

		const post_options = {
			host: '127.0.0.1',
			port: '8070',
			path: url,
			method: 'DELETE',
			headers: {
				'X-API-KEY' : 'raspberry',
				'accept' : 'application/json'
			}
		};

		let post_req = http.request(post_options, function(res) {
			res.setEncoding('utf8');
			let data = '';
			res.on('data', function (chunk) {
				if(chunk) {
					data += chunk;
				}
			});
			res.on('end', function() {
				if(data.length) {
					resolve(JSON.parse(data));
				} else {
					resolve(null);
				}
			});
		});

		post_req.end();

	});

}

function httpPost(url, body) {

	return new Promise( function(resolve, reject) {

		const post_data = JSON.stringify(body);

		const post_options = {
			host: '127.0.0.1',
			port: '8070',
			path: url,
			method: 'POST',
			headers: {
				'X-API-KEY' : 'raspberry',
				'accept' : 'application/json'
			}
		};

		if(body) {
			post_options.headers['Content-Type'] = 'application/json';
			post_options.headers['Content-Length'] = Buffer.byteLength(post_data);
		}

		let post_req = http.request(post_options, function(res) {
			res.setEncoding('utf8');
			let data = '';
			res.on('data', function (chunk) {
				if(chunk) {
					data += chunk;
				}
			});
			res.on('end', function() {
				if(data.length) {
					resolve(JSON.parse(data));
				} else {
					resolve(null);
				}
			});
		});

		// post the data
		if(body) {
			post_req.write(post_data);
		}
		post_req.end();

	});

}

/**
 * BLOCK 3 : Close Wallet on Process Exit
 **/

async function exitHandler() {
	console.log('Exit detected, closing wallet');
    await httpDel('/wallet')

	console.log('Wallet closed, stopping process');
	process.exit();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);
