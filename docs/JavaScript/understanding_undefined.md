# undefined

In JavaScript, seeing a variable come up as undefined is one of the most common things you will encounter as a developer.

To keep it simple (KISS), undefined is JavaScript's built-in way of saying: "The variable name exists, but it is completely empty because no data was ever put inside it."

## undefined (KISS Edition)

Here is a quick look at the core concepts packed inside this documentation file:

## 1. Where and Why undefined Happens

There are three common traps that cause a variable to become undefined:

- Trap A: Creating a variable but forgetting to give it a value.

let userPassword;
console.log(userPassword); // Prints: undefined

- Trap B: Looking for a property inside an object that doesn't exist.

If your curl command sends {"username": "elderdo"}, but your server code mistakenly looks for req.body.phoneNumber, JavaScript won't crash—it will simply say the phone number is undefined.

- Trap C: Forgetting to write return inside a function.
  If a function performs calculations but forgets to explicitly send the result back using the word return, it hands back undefined by default.

## 2. The Operational Impact on Your Code

The impact depends entirely on how you treat the undefined variable:

- The Safe Impact (Conditional Checks): As you learned in your [logic cheatsheet](logic-cheatsheet.md), undefined is naturally Falsy. This means using if (!variable) handles undefined beautifully and stops errors before they happen.
- The Crash Impact (The Dreaded TypeError): If you try to treat an undefined variable like it contains real data, your code will crash instantly. For example, trying to turn an empty username into uppercase characters (undefined.toUpperCase()) will break your server with a TypeError: Cannot read properties of undefined message.

---
