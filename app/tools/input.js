const readline = require("readline");

class Input {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.rl.on("close", function() {
            console.warn("\nChat closed !!!");
            process.exit(0);
        });
    }

    question(message) {
        return new Promise((resolve, reject) => {
            this.rl.question(message, (value) => resolve(value))
        })
    }

    write(message) {
        this.rl.write("\n"+message)
    }
}

module.exports = Input