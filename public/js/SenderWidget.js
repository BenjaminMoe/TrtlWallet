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

const SenderWidget = (function() {

	this.MEM = {}

	this.DOM = {
		step_01 : {
			send_to : document.getElementById('SenderWidget.step_01.send_to'), 
			address : document.getElementById('SenderWidget.step_01.address'),
			amount : document.getElementById('SenderWidget.step_01.amount'),
			prepare : document.getElementById('SenderWidget.step_01.prepare')
		},
		step_02 : {
			you_send : document.getElementById('SenderWidget.step_02.you_send'),  
			network_fee : document.getElementById('SenderWidget.step_02.network_fee'), 
			developer_fee : document.getElementById('SenderWidget.step_02.developer_fee'),  
			node_fee : document.getElementById('SenderWidget.step_02.node_fee'),  
			total : document.getElementById('SenderWidget.step_02.total'),  
			submit : document.getElementById('SenderWidget.step_02.submit'),
			cancel : document.getElementById('SenderWidget.step_02.cancel') 
		}
	}

	this.EVT = {
		handleSelectChange : evt_handleSelectChange.bind(this),
		handlePrepareClick : evt_handlePreprareClick.bind(this),
		handleSubmitClick : evt_handleSubmitClick.bind(this),
		handleCancelClick : evt_handleCancelClick.bind(this)
	}

	this.API = {
		updateSelect : api_updateSelect.bind(this),
		getSelected : api_getSelected.bind(this),
		getBalance : api_getBalance.bind(this),
		poll : api_poll.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		// Clear Inputs

		this.DOM.step_01.address.value = '';

		// Add Events Listeners

		this.DOM.step_01.send_to.addEventListener('change', this.EVT.handleSelectChange);
		this.DOM.step_01.prepare.addEventListener('click', this.EVT.handlePrepareClick);
		this.DOM.step_02.submit.addEventListener('click', this.EVT.handleSubmitClick);
		this.DOM.step_02.cancel.addEventListener('click', this.EVT.handleCancelClick);

	}

	function api_getSelected() {

		let key = this.DOM.select.value;
		let user = this.MEM.users[key];
		return user;

	}

	function evt_handleSelectChange() {

		let key = this.DOM.step_01.send_to.value;
		let user = this.MEM.users[key];

		if(!user) {
			this.MEM.to = null;
			this.DOM.step_01.address.value = '';
			this.DOM.step_01.address.removeAttribute('disabled');
		} else {
			this.MEM.to = user;
			this.DOM.step_01.address.value = user.wallet_address;
			this.DOM.step_01.address.setAttribute('disabled', 'disabled');
		}

	}
	
	function api_updateSelect(users) {
		
		this.MEM.users = users;
		this.DOM.step_01.send_to.innerHTML = '';

		let def = document.createElement('option');
		def.setAttribute('value', '');
		def.textContent = 'Direct Input';
		this.DOM.step_01.send_to.appendChild(def);

		for(let key in users) {
			let opt = document.createElement('option');
			opt.setAttribute('value', key);
			opt.textContent = key
			this.DOM.step_01.send_to.appendChild(opt);
		}

	}

	function evt_handlePreprareClick() {
		
		this.MEM.from = UserWidget.API.getUser();
		
		if(this.MEM.to && this.MEM.to.name === this.MEM.from.name) {
			return alert("A user can not send to themselves");
		} else if(!this.MEM.to && this.DOM.step_01.address.value.length < 80) {
			return alert("Please enter a TRTL address to send to");
		}

		let amount = parseFloat(this.DOM.step_01.amount.value);
		let trtl = amount.toFixed(2);
		this.DOM.step_01.amount.value = trtl;
		let shells = Math.floor(amount * 100);

		let body = {
			from_name : this.MEM.from.name,
			from_address : this.MEM.from.wallet_address,
			to_address : this.DOM.step_01.address.value,
			amount : shells
		};

		this.MEM.to_amount = shells;

		let ajax = new XMLHttpRequest();
		ajax.open('POST', '/trtl/prepareTransaction');
		ajax.setRequestHeader('Content-type', 'application/json');
		ajax.send(JSON.stringify(body));

		ajax.onload = async () => {
			
			let res;

			try {
				res = JSON.parse(ajax.responseText);
			} catch(err) {
				throw err;
			}
			
			this.MEM.prep = res.msg;

			this.DOM.step_01.send_to.setAttribute('disabled', 'disabled');
			this.DOM.step_01.address.setAttribute('disabled', 'disabled');
			this.DOM.step_01.amount.setAttribute('disabled', 'disabled');

			this.DOM.step_02.you_send.value = trtl;
			this.DOM.step_02.network_fee.value = (40).toFixed(2);
			this.DOM.step_02.node_fee.value = (this.MEM.prep.fee / 100).toFixed(2);
			this.DOM.step_02.total.value = ((shells + this.MEM.prep.fee + 4000) / 100).toFixed(2);

		}

	}

	function evt_handleSubmitClick() {

		let body = {
			from_name : this.MEM.from.name,
			from_address : this.MEM.from.wallet_address,
			from_total : this.MEM.to_amount + this.MEM.prep.fee,
			to_username : this.MEM.to ? this.MEM.to.name : null,
			to_address : this.DOM.step_01.address.value,
			to_amount : this.MEM.to_amount,
			hash : this.MEM.prep.transactionHash
		}
		
		let ajax = new XMLHttpRequest();
		ajax.open('POST', '/trtl/sendTransaction');
		ajax.setRequestHeader('Content-type', 'application/json');
		ajax.send(JSON.stringify(body));

		ajax.onload = () => {
			let res;

			try {
				res = JSON.parse(ajax.responseText);
			} catch(err) {
				throw err;
			}

			this.MEM.hash = res.msg;

			this.API.poll();
			setTimeout(this.API.poll, 30 * 1000);
			setTimeout(this.API.poll, 60 * 1000);
			setTimeout(this.API.poll, 75 * 1000);
			setTimeout(this.API.poll, 90 * 1000);

			this.DOM.step_01.send_to.removeAttribute('disabled');
			this.DOM.step_01.address.removeAttribute('disabled');
			this.DOM.step_01.amount.removeAttribute('disabled');

			this.DOM.step_01.amount.value = '';

			this.DOM.step_02.you_send.value = '';
			this.DOM.step_02.total.value = '';
			this.DOM.step_02.network_fee.value = '';
			this.DOM.step_02.node_fee.value = '';
			
		}


	}

	function evt_handleCancelClick() {
		
		let body = {
			hash : this.MEM.prep.transactionHash
		}

		let ajax = new XMLHttpRequest();
		ajax.open('POST', '/trtl/cancelTransaction');
		ajax.setRequestHeader('Content-type', 'application/json');
		ajax.send(JSON.stringify(body));

		ajax.onload = () => {
			
			let res;

			try {
				res = JSON.parse(ajax.responseText);
			} catch(err) {
				throw err;
			}

			this.DOM.step_01.send_to.removeAttribute('disabled');
			this.DOM.step_01.address.removeAttribute('disabled');
			this.DOM.step_01.amount.removeAttribute('disabled');

			this.DOM.step_02.you_send.value = '';
			this.DOM.step_02.total.value = '';
		}	

	}

	function api_getBalance(user) {

		return new Promise( (resolve, reject) => {

			let ajax = new XMLHttpRequest();
			ajax.open('POST', '/trtl/getBalance');
			ajax.setRequestHeader('Content-type', 'application/json');
			ajax.send(JSON.stringify(user));

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

		let balance = await this.API.getBalance(this.MEM.from);
		if(this.MEM.to) {
			await this.API.getBalance(this.MEM.to);
		}

		UserWidget.API.getUsers();
		UserWidget.API.getHistory();

	}


}).apply({});

