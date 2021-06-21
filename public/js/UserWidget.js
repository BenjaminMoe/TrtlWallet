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

const UserWidget = (function() {

	this.MEM = {}

	this.DOM = {
		add_user : document.getElementById('UserWidget.add_user'),
		list_users : document.getElementById('UserWidget.list_users'),
		history : {
			avatar : document.getElementById('UserWidget.history.avatar'),
			name : document.getElementById('UserWidget.history.name'),
			refresh : document.getElementById('UserWidget.history.refresh'),
			balance : document.getElementById('UserWidget.history.balance'),
			list : document.getElementById('UserWidget.history.list') 
		}
	}

	this.EVT = {
		handleAddUserClick : evt_handleAddUserClick.bind(this),
		handleUserClick : evt_handleUserClick.bind(this)
	}

	this.API = {
		getAdjectives : api_getAdjectives.bind(this),
		getAnimals : api_getAnimals.bind(this),
		getUsers : api_getUsers.bind(this),
		generateUser : api_generateUser.bind(this),
		getAvatar : api_getAvatar.bind(this),
		getHistory : api_getHistory.bind(this),
		getUser : api_getUser.bind(this),
		renderHistory : api_renderHistory.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		// Get User list

		this.API.getUsers();

		// Append Event Listeners

		this.DOM.add_user.addEventListener('click', this.EVT.handleAddUserClick);
		this.DOM.list_users.addEventListener('click', this.EVT.handleUserClick);

		// Get Static Data to Avoid Clutter

		this.API.getAdjectives();
		this.API.getAnimals();

	}

	function api_getUser() {
		
		return this.MEM.user;

	}

	function api_getUsers() {

		this.MEM.users = {};

		let ajax = new XMLHttpRequest();
		ajax.open('POST', '/trtl/selectUsers');
		ajax.setRequestHeader('Content-type', 'application/json');
		ajax.send();

		ajax.onload = () => {
			
			let res;

			try {
				res = JSON.parse(ajax.responseText);
			} catch(err) {
				throw err;
			}
			
			let div = document.createElement('div');

			res.msg.forEach(user => {
				let li = document.createElement('li');
				li.userData = user;

				let avatar = document.createElement('div');
				avatar.setAttribute('class', 'circle');
				avatar.style.backgroundImage = `url('${user.avatar}')`;

				let name = document.createElement('div');
				name.setAttribute('class', 'username');
				name.textContent = user.name;
				this.MEM.users[user.name] = user;

				let balance = document.createElement('div');
				balance.setAttribute('class', 'balance');

				let shells = user.wallet_balance.unlocked;
				let trtl = (shells / 100).toFixed(2);
				balance.textContent = `${trtl} TRTL`;

				if(this.MEM.user && user.name === this.MEM.user.name) {
					this.MEM.li = li;
					li.classList.add('active');
					this.DOM.history.balance.textContent = trtl;
				}

				li.appendChild(avatar);
				li.appendChild(name);
				li.appendChild(balance);
				div.appendChild(li);

			});
			
			let item = this.DOM.list_users;

			if(item.childNodes.length === 0) {
				item.appendChild(div);
			} else {
				item.replaceChild(div, item.childNodes[0]);
			}
			
			SenderWidget.API.updateSelect(this.MEM.users);
		}

	}

	function api_getAvatar(adj, noun) {

		return new Promise( (resolve, reject) => {
			
			let url = `https://ui-avatars.com/api/?name=${adj}+${noun}&background=random`;
			let ajax = new XMLHttpRequest();
			ajax.open('GET', url);
			ajax.responseType = 'arraybuffer';
			ajax.send();

			ajax.onload = () => {

				let binary = '';
				let bytes = new Uint8Array(ajax.response);
				let len = bytes.byteLength;
				for (var i = 0; i < len; i++) {
					binary += String.fromCharCode( bytes[ i ] );
				}
				let str = window.btoa(binary);
				resolve('data:image/png;base64,' + str);

			}

		});

	}

	async function api_generateUser() {

		let adj, noun, name;

		let found = true;
		while(found) {
			const a = this.MEM.adjectives;
			const a_len = this.MEM.adjectives.length;
			const a_pos = Math.floor(Math.random() * a_len);
			const b = this.MEM.animals;
			const b_len = this.MEM.animals.length;
			const b_pos = Math.floor(Math.random() * b_len);
			
			adj = a[a_pos];
			noun =  b[b_pos];
			name =  adj + noun;
			found = (name in this.MEM.users);
		}
		
		let avatar = await this.API.getAvatar(adj, noun);
		
		let args = {
			img : avatar,
			name : name
		}

		let ajax = new XMLHttpRequest();
		ajax.open('POST', '/trtl/createUser');
		ajax.setRequestHeader('Content-type', 'application/json');
		ajax.send(JSON.stringify(args));

		ajax.onload = () => {

			this.API.getUsers();

		}

	}

	function evt_handleAddUserClick() {

		this.API.generateUser();

	}

	function api_getAdjectives() {

		let ajax = new XMLHttpRequest();
		ajax.open('GET', 'data/adjectives.json');
		ajax.send(); 

		ajax.onload = () => {

			let res;

			try {
				res = JSON.parse(ajax.responseText);
			} catch(err) {
				throw err;
			}

			this.MEM.adjectives = res;
		}

	}

	function api_getAnimals() {

		let ajax = new XMLHttpRequest();
		ajax.open('GET', 'data/animals.json');
		ajax.send(); 

		ajax.onload = () => {

			let res;

			try {
				res = JSON.parse(ajax.responseText);
			} catch(err) {
				throw err;
			}

			this.MEM.animals = res;
		}

	}
	
	function evt_handleUserClick(evt) {

		let elem = evt.target;
		while(elem.parentNode && elem.tagName !== 'LI') {
			if(elem === this.DOM.list_users) {
				return;
			}
			elem = elem.parentNode;
		}

		let userData = elem.userData;
		if(!userData) {
			return;
		}

		if(this.MEM.li) {
			this.MEM.li.classList.remove('active');
		}

		this.MEM.user = userData;
		this.MEM.li = elem;
		this.MEM.li.classList.add('active');

		this.DOM.history.avatar.style.backgroundImage = `url('${this.MEM.user.avatar}')`;
		this.DOM.history.name.textContent = this.MEM.user.name;

		let shells = this.MEM.user.wallet_balance.unlocked;
		let trtl = (shells / 100).toFixed(2);
		this.DOM.history.balance.textContent = trtl;

		this.API.getHistory();

	}

	function api_getHistory() {
	
		let body = {
			name : this.MEM.user.name
		}

		let ajax = new XMLHttpRequest();
		ajax.open('POST', '/trtl/getHistory');
		ajax.setRequestHeader('Content-type', 'application/json');
		ajax.send(JSON.stringify(body));

		ajax.onload = () => {
			
			let res;
			
			try {
				res = JSON.parse(ajax.responseText);
			} catch(err) {
				throw err;
			}
			
			this.API.renderHistory(res.msg);

		}

	}
	
	function api_renderHistory(list) {

		const div = document.createElement('div');

		list.forEach( hist => {

			let li = document.createElement('li');
			let table = document.createElement('table');
			
			let icon = document.createElement('div');

			let row1 = table.insertRow();
			let row2 = table.insertRow();

			let cell1 = row1.insertCell();
			let cell2 = row1.insertCell();
			let cell3 = row2.insertCell();
		
			cell1.setAttribute('rowspan', '2');
			cell1.setAttribute('class', 'icon');
			cell1.appendChild(icon);
			
			if(!hist.from_username) {
				cell2.textContent = 'Deposit';
				icon.setAttribute('class', 'icon deposit');
			} else if(hist.from_username === this.MEM.user.name) {
				cell2.textContent = `Send to ${hist.to_username}`;
				icon.setAttribute('class', 'icon send');
			} else if(hist.to_username === this.MEM.user.name) {
				cell2.textContent = `Received from ${hist.from_username}`;
				icon.setAttribute('class', 'icon receive');
			} else {
				cell2.textContent = 'Withdraw';
				icon.setAttribute('class', 'icon withdraw');
			}
			
			let shells = parseInt(hist.to_amount);
			let trtl = (shells / 100).toFixed(2);
			cell3.textContent = `${trtl} TRTL`;
			li.appendChild(table);
			div.appendChild(li);

		});
			
		let item = this.DOM.history.list;

		if(item.childNodes.length === 0) {
			item.appendChild(div);
		} else {
			item.replaceChild(div, item.childNodes[0]);
		}

	}

}).apply({});
