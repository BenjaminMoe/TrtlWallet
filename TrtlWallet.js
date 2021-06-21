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

/**
 * BLOCK 1 : Imports
 **/

const lite = require('./lite.js');
const wallet = require('./wallet.js');

/**
 * BLOCK 2 : Express
 **/

const express = require('express')
const app = express()
const port = 2000
app.use(express.json());
app.use(express.static('public'))

app.post('/trtl/prepareTransaction', async function(req, res) {

	console.log("Prep Transaction!!!");
	let prep = await wallet.prepare(req.body);
	console.log(prep);

	res.json({
		err : 0,
		msg : prep
	});

});

app.post('/trtl/cancelTransaction', async function(req, res) {

	console.log("Now we cancel the transaction!!!");
	await wallet.cancel(req.body.hash);

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/trtl/sendTransaction', async function(req, res) {

	console.log("GO TIME!!! Sending transactioN!!");
	
	let trans = await wallet.send(req.body.hash);

	console.log(trans);

	await lite.logTransaction(req.body);

	console.log("Transaction logged!!!");

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/trtl/selectUsers', async function(req, res) {

	let users = await lite.selectUsers();

	res.json({
		err : 0,
		msg : users
	});

});

app.post('/trtl/getHistory', async function(req, res) {
	
	console.log('Getting the history');

	let name = req.body.name;
	let history = await lite.getHistory(name);

	res.json({
		err : 0,
		msg : history
	});

});

app.post('/trtl/getBalance', async function(req, res) {
	
	console.log('Get the balance');

	let addr = req.body.wallet_address;
	let balance = await wallet.getBalance(addr);
	await lite.updateBalance(req.body, balance);

	res.json({
		err : 0,
		msg : balance
	});

});

app.post('/trtl/createUser', async function(req, res) {

	let addr = await wallet.createAddress();
	await lite.createUser(req.body, addr);
		
	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/trtl/logDeposit', async function(req, res) {

	console.log('Report a Deposit');

	await lite.logDeposit(req.body);
		
	res.json({
		err : 0,
		msg : 'okay'
	});

});

/**
 * BLOCK 3 : Listen
 **/

app.listen(port, () => {
	console.log(`TrtlWallet is listening at http://localhost:${port}`)
})


