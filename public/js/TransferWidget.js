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

const TransferWidget = (function() {

	this.MEM = {
	}

	this.DOM = {
		mode : document.getElementById('TransferWidget.mode'),
		tabs : {
			send : document.getElementById('TransferWidget.tabs.send'),
			deposit : document.getElementById('TransferWidget.tabs.deposit')
		}
	}

	this.EVT = {
		handleSendTabClick : evt_handleSendTabClick.bind(this),
		handleDepositTabClick : evt_handleDepositTabClick.bind(this)
	}

	this.API = {
		updateMode : api_updateMode.bind(this)
	}

	init.apply(this);
	return this;

	function init() {
	
		this.MEM.mode = localStorage.getItem('mode') || 'send';
		this.API.updateMode();

		this.DOM.tabs.send.addEventListener('click', this.EVT.handleSendTabClick);
		this.DOM.tabs.deposit.addEventListener('click', this.EVT.handleDepositTabClick);
		
	}

	function evt_handleSendTabClick() {

		this.MEM.mode = 'send';
		this.API.updateMode();

	}

	function evt_handleDepositTabClick() {

		this.MEM.mode = 'deposit';
		this.API.updateMode();

	}

	function api_updateMode() {
		
		localStorage.setItem('mode', this.MEM.mode);
		this.DOM.mode.setAttribute('class', `amount ${this.MEM.mode}`);

	}

}).apply({});
