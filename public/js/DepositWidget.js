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

const DepositWidget = (function() {

	this.MEM = {
	}

	this.DOM = {
		step_01 : {
			amount : document.getElementById('DepositWidget.step_01.amount'),
			prepare : document.getElementById('DepositWidget.step_01.prepare'),
			poll : document.getElementById('DepositWidget.step_01.poll')
		}, 
		step_02 : {
			qr_code : document.getElementById('DepositWidget.step_02.qr_code'),
			cancel : document.getElementById('DepositWidget.step_02.cancel'),
		}
	}

	this.EVT = {
		handlePrepareClick : evt_handlePrepareClick.bind(this),
		handleCancelClick : evt_handleCancelClick.bind(this)
	}

	this.API = {
		wait : api_wait.bind(this),
		getBalance : api_getBalance.bind(this),
		poll : api_poll.bind(this),
		logDeposit : api_logDeposit.bind(this)
	}

	init.apply(this);
	return this;

	function init() {
	
		this.MEM.qrcode = new QRCode(this.DOM.step_02.qr_code, {
			text : 'Hello, World',
			width: 500,
			height: 500
		});

		this.DOM.step_01.prepare.addEventListener('click', this.EVT.handlePrepareClick);
		this.DOM.step_02.cancel.addEventListener('click', this.EVT.handleCancelClick);

	}

	function api_logDeposit(shells) {

		return new Promise( (resolve, reject) => {
			
			let ajax = new XMLHttpRequest();
			ajax.open('POST', '/trtl/logDeposit');
			ajax.setRequestHeader('Content-type', 'application/json');
			ajax.send(JSON.stringify({
				name : this.MEM.user.name,
				address : this.MEM.user.wallet_address,
				amount : shells
			}));
			
			ajax.onload = () => {
				
				let res;

				try {
					res = JSON.parse(ajax.responseText);
				} catch(err) {
					throw err;
				}
				
				resolve(res.msg);
			}

		});

	}

	async function api_poll() {

		let balance = await this.API.getBalance();
		let diff = balance.unlocked - this.MEM.balance.unlocked;

		if(!diff) {
			return;
		}

		clearInterval(this.MEM.timeout);
		this.DOM.step_01.poll.textContent = '';
		
		await this.API.logDeposit(diff);

		UserWidget.API.getUsers();
		UserWidget.API.getHistory();
		
	}

	async function evt_handlePrepareClick() {

		let user = UserWidget.API.getUser();
		if(!user) {
			return;
		}
		
		this.MEM.user = user;
		let amount = parseFloat(this.DOM.step_01.amount.value);
		if(!amount) {
			return;
		}
		let str = amount.toFixed(2);
		this.DOM.step_01.amount.value = str;
		amount = parseFloat(str);

		let shells = Math.floor(amount * 100);
		this.MEM.shells = shells;
		let addr = user.wallet_address;
		let name = user.name;

		let url = `turtlecoin://${addr}?amount=${shells}&name=${name}`

		this.MEM.qrcode.clear();
		this.MEM.qrcode.makeCode(url);
		this.MEM.balance = await this.API.getBalance();
		this.MEM.timeout = setInterval(this.API.poll, 5000);
		this.DOM.step_01.poll.textContent = 'Polling';

	}

	function api_wait(ms) {
		
		return new Promise( (resolve, reject) => {
			
			setTimeout( () => {
				resolve();
			}, ms);

		});

	}

	function api_getBalance() {

		return new Promise( (resolve, reject) => {
			
			let ajax = new XMLHttpRequest();
			ajax.open('POST', '/trtl/getBalance');
			ajax.setRequestHeader('Content-type', 'application/json');
			ajax.send(JSON.stringify(this.MEM.user));
			
			ajax.onload = () => {
				
				let res;

				try {
					res = JSON.parse(ajax.responseText);
				} catch(err) {
					throw err;
				}
				
				resolve(res.msg);
			}

		});

	}

	async function evt_handleCancelClick() {

		clearInterval(this.MEM.timeout);
		this.DOM.step_01.poll.textContent = '';

	}

}).apply({});
