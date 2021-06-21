# Turtle Wallet Debug Environment

This is a simple page that I made as a test for working with Turtle wallets paired 
to an account for web applications. I wanted to make a test page to familiar with
Turtle before trying to integrate it into an application, and I'm making the code
available if it helps anyone else to those ends. 

The test application is intended to run on a local server running a Turtlecoind
node and the wallet-api. This might not be neccesary, but I will cover more of
the nuances with respect to implementation in another section. To be clear, this
test page was created for the purposes of getting familiar with Turtlecoin®, and
there are a lot of cut corners, and "good enough" implementations.

## Screenshots

In this test application you create a list of users. Each user is created with a wallet.

![Screenshot 2021-06-20 at 11-34-37 TrtlWallet](https://user-images.githubusercontent.com/5259968/122661092-bfb2ee00-d1c1-11eb-918c-36e483f20be5.png)

You can deposit Turtlecoins into one of the wallets and then send it around to other users.

![Screenshot 2021-06-20 at 11-33-21 TrtlWallet](https://user-images.githubusercontent.com/5259968/122661095-c17cb180-d1c1-11eb-88dc-45e80f8fdc7e.png)

It was the intended to add a withdraw functions, but I honestly haven't tested it. If you're using
it, only use a small amount that you don't mind burning. 

## Setup the Environment

- Run turtlecoind
- Run wallet-api

```
$ git clone https://github.com/wsdCollins/TrtlWallet.git
$ cd TrtlWallet
$ npm install
$ node TrtlWallet.js
```

And the application will be listening on the machine using port 2000. 

## Thoughts

My first impression with Turtlecoin® is with how easy it is to use, once you know where to look.
The devs include a guide on how to set up a [node on a Raspberry Pi](https://docs.turtlecoin.lol/developer/running-turtlecoind-on-pi). Which admittedly is a little out-dated, as releases have been moved from discord
to the [releases section on Github](https://github.com/turtlecoin/turtlecoin/releases). And 
instructions on how to compile can be found on [this Reddit thread](https://www.reddit.com/r/TRTL/comments/ntg17c/running_turtlecoind_on_raspberry_pi/). And then there are some command line options for turtlecoind
that can only be found in [this blog post](https://blog.turtlecoin.lol/archives/running-a-public-node-for-fun-profit/).

Once you have a node running, you can run the [wallet-api](https://turtlecoin.github.io/wallet-api-docs/),
which provides a REST API that this repository uses to interact with sending wallets. By default the
wallet-api will interest with the turtlecoind process running on localhost, but it might be possible
to use it with a public node. And this contributes to one of the trade offs, as using 
[Turtlepay®](https://docs.turtlepay.io/) to confirm when the transaction is received. Turtlepay® 
requires a public url for web hooks, so I resorted to polling the wallet's balance to detect
transactions.

## Cut-Corners

There are a lot of cut corners in this application. And I'll try to go through some of the ones
that I am aware of. The first one being using an external service to generate avatars. All I need
to do is make a canvas with a random color for a background and two centered white letters. This
shouldn't take too long to fix, but it's not that important either.

Another corner cut is the transactions. In this case both the user sending Turtlecoin and 
receiving Turtlecoin are in the same system, I can register the receiving transaction
because I know who sent it. But this only works for the conditions of the test application,
so utilizing something like Turtlepay® would take the guess-work out of looking for transactions.

There are a lot of UI based corners that have been cut. After preparing a transaction I should 
lock the UI so that you must cancel the transaction before doing anything else. But currently
you can select another user, or change to the deposit tab. So more effective control of forcing
valid actions would probably be a good idea.

I didn't look into transactions at all. I don't have experience with blockchains, so being 
aware of what the current block height is, and searching for transactions from a certain height
for a certain amount of blocks isn't something I implemented in this example.

And last withdrawing is another corner that has been cut. I lazily added the option to manually
put in an address to withdraw funds. I should probably put in an option to close-out the application
that would automatically drain all of the sub-wallets into the address specified would also be a good
idea. 

Note that just because something is a good idea, doesn't mean I plan on implementing it in a
timely fashion. The goal for this repository was to gain familiarity, not to act as a reference
implementation.

## Improvements

The biggest improvement I can think of to this test application would be to integrate the
REST API elements. Specifically there are three separate processes that are communicating
with eachother, Turtlecoind that acts as a node, the wallet-api, and potentially Turtlepay.
It would make a lot of sense to implement these all into one process. 

If there is a reference implementation for interacting with the Turtlecoin® network, then it
seems like I could write a Nodejs module that could listen and send packets on port 11898
to communicate with other nodes. That way I could both send, and listen for transactions directly
from Nodejs, and then be able to send push notifications to clients when transactions were received.

For the wallet, this would also be beneficial to implement directly in a single process. Pragmatically
the wallet-api is well implemented and easy to work with. But if you're sending requests to
the network using Nodejs, then it makes sense to have the wallet functionality implemented directly
to be able to send requests to the network, and be able to do something with payments detected 
on the network.

## Copyright

Copyright 2021 Benjamin Collins MIT License
