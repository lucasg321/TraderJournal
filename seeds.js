var mongoose = require("mongoose");
var Trade = require("./models/trade");
var Comment   = require("./models/comment");

var seeds = [
    {
        username: "Mary Bear",
        image: "https://pbs.twimg.com/media/EJcLDHAUcAELr4g.png", //add default --> {type: String, default: "placeholderimg.jpg"}
        ticker: "AIHS",
        type: "Long", //long or short
        winOrLoss: "Win",
        avgOpen: 1.41,
        avgClose: 1.57,
        stop: 1.29,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
        username: "Lucas Bull",
        image: "https://pbs.twimg.com/media/EIs45kKXkAAL0YB.png", //add default --> {type: String, default: "placeholderimg.jpg"}
        ticker: "AGRX",
        type: "Short", //long or short
        winOrLoss: "Win",
        avgOpen: 2.58,
        avgClose: 2.38,
        stop: 2.71,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
        username: "Bully Bear",
        image: "https://pbs.twimg.com/media/EJbs6DHW4AIF1DL.jpg", //add default --> {type: String, default: "placeholderimg.jpg"}
        ticker: "AIHS",
        type: "Long", //long or short
        winOrLoss: "Win",
        avgOpen: 1.41,
        avgClose: 1.30,
        stop: 1.55,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
];

async function seedDB(){
    try {
        await Trade.remove({});
        console.log('Trades removed');
        await Comment.remove({});
        console.log('Comments removed');

        for(const seed of seeds) {
            let trade = await Trade.create(seed);
            console.log('Trade created');
            let comment = await Comment.create(
                {
                    text: 'Nice trade. You should hold your winners longer!',
                    author: 'Homer'
                }
            )
            console.log('Comment created');
            trade.comments.push(comment);
            trade.save();
            console.log('Comment added to trade');
        }
     } catch(err) {
         console.log(err);
    }
 }

module.exports = seedDB;