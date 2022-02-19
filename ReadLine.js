import { Writable } from "stream";
import { createInterface } from "readline";

const writable = new Writable({
    write(data, encoding, callback) {
        if (data.length === 1)
            readline.prompt(true);
        else if (data[0] === 0x1b);
        else {
            process.stdout.write(data);
            console.log();
        }

        callback();
    }
});


const readline = createInterface({
    input: process.stdin,
    output: writable,
    terminal: true,
});


export default function ReadLine(question, Callback = console.log) {
    const Question = () => readline.question(question, ReadLine2);

    function ReadLine2(answer) {
        Callback(answer);
        Question();
    }

    Question();
    return readline;
}

//readline.clearLine(process.stdout, 0);
