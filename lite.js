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

const uniqid = require('uniqid');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('users.sqlite');

db.serialize(function() {

	db.run(`
		CREATE TABLE IF NOT EXISTS dat_users (
			avatar TEXT,
			name VARCHAR(255) UNIQUE,
			wallet_address VARHCAR(255),
			private_spend_key VARCHAR(255),
			public_spend_key VARCHAR(255),
			wallet_balance TEXT
		)
	`);
	
	db.run(`
		CREATE TABLE IF NOT EXISTS dat_transactions (
			from_username VARCHAR(255),
			from_address VARCHAR(255),
			from_total VARCHAR(255),
			to_username VARHCAR(255),
			to_address VARCHAR(255),
			to_amount VARCHAR(255),
			transaction_details TEXT
		)
	`);
	
});

module.exports = {

	logTransaction : function(body) {
		
		return new Promise( function(resolve, reject) {
			
			let sql = `
				INSERT INTO dat_transactions (
					from_username,
					from_address,
					from_total,
					to_username,
					to_address,
					to_amount
				) VALUES (
					?,
					?,
					?,
					?,
					?,
					?
				)
			`;

			let args = [
				body.from_name,
				body.from_address,
				body.from_total,
				body.to_username,
				body.to_address,
				body.to_amount
			];
			
			db.run(sql, args, function(err) {
				if(err) {
					throw err;
				}
				
				resolve();
			});

		});
	},

	getHistory : function(name) {

		return new Promise( function(resolve, reject) {

			console.log(name);

			let sql = `
				SELECT
					from_username,
					from_address,
					from_total,
					to_username,
					to_address,
					to_amount,
					transaction_details
				FROM
					dat_transactions
				WHERE
					to_username = ?
				OR
					from_username = ?
				ORDER BY
					rowid ASC
			`;

			let args = [
				name,
				name
			];
			
			db.all(sql, args, function(err, rows) {
				if(err) {
					throw err;
				}

				console.log(rows);
				resolve(rows);
			});

		});

	},

	logDeposit : function(to) {

		return new Promise(function (resolve, reject) {
			
			let sql = `
				INSERT INTO dat_transactions (
					to_username,
					to_address,
					to_amount
				) VALUES (
					?,
					?,
					?
				)
			`;

			let args = [
				to.name,
				to.address,
				to.amount
			];
			
			db.run(sql, args, function(err) {
				if(err) {
					throw err;
				}
				
				resolve();
			});

		});
			
	},

	selectUsers: function() {
		
		return new Promise(function (resolve, reject) {
			let sql = `
				SELECT
					avatar,
					name,
					wallet_address,
					private_spend_key,
					wallet_balance
				FROM 
					dat_users
				ORDER BY 
					rowid ASC
			`;
			
			db.all(sql, function(err, rows) {
				if(err) {
					throw err;
				}

				for(let i = 0; i < rows.length; i++) {
					rows[i].wallet_balance = JSON.parse(rows[i].wallet_balance);
				}
				resolve(rows);
			});
			
		});
		
	},
	
	createUser : function(user, address) {
	
		return new Promise( function(resolve, reject) {
		
			let sql = `
				INSERT INTO dat_users (
					avatar,
					name,
					wallet_address,
					private_spend_key,
					public_spend_key,
					wallet_balance
				) VALUES (
					?,
					?,
					?,
					?,
					?,
					?
				)
			`;
			
			const bal = JSON.stringify({
				locked : 0,
				unlocked : 0
			});
			
			let args = [
				user.img,
				user.name,
				address.address,
				address.privateSpendKey,
				address.publicSpendKey,
				bal
			];
			
			db.run(sql, args, function(err) {
				if(err) {
					throw err;
				}
				
				resolve();
			});
			
		});
	
	},

	updateBalance : function(user, balance) {
	
		return new Promise( function(resolve, reject) {
		
			let sql = `
				UPDATE 
					dat_users
				SET
					wallet_balance = ?
				WHERE
					name = ?
			`;
			
			const bal = JSON.stringify(balance);
			
			let args = [
				bal,
				user.name
			];
			
			db.run(sql, args, function(err) {
				if(err) {
					throw err;
				}
				
				resolve();
			});
			
		});

	

	}

}



