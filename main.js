// Take the string represenation of the program
// Outputs a list of tokens in that string
// A Token is an indivisible syntactic unit
// Tokens are seperated by whitespace(spaces, tabs, newlines)
function tokenize(chars) {
  return chars.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim().split(/\s+/);
}

// A parser structures the tokens according to the program structure,
// producing a parse tree that encodes the structure of the input program (AST)
// Paranthesis provide the program structure, so are removed from the parse tree
function parse(program) {
  return readFromTokens(tokenize(program));
}

function readFromTokens(tokens) {
  let L = [];
  console.log("tokens", tokens);
  if (tokens.length === 0) {
    throw new SyntaxError("unexpected EOF");
  }

  let token = tokens.shift();

  if (token === "(") {
    while (tokens[0] !== ")") {
      L.push(readFromTokens(tokens));
    }
    console.log("L", L);
    tokens.shift();
    return L;
  } else if (token === ")") {
    throw new SyntaxError("Unexpected");
  } else {
    return atom(token);
  }
}

function atom(token) {
  let numVal = Number(token);
  if (numVal) {
    return numVal;
  }
  return token;
}

//
// Parser
//

function Parser(tokens) {
  this.tokens = tokens;
}

function readFromTokens(tokens) {
  let L = [];
  console.log("tokens", tokens);
  if (tokens.length === 0) {
    throw new SyntaxError("unexpected EOF");
  }

  let token = tokens.shift();

  if (token === "(") {
    while (tokens[0] !== ")") {
      L.push(readFromTokens(tokens));
    }
    console.log("L", L);
    tokens.shift();
    return L;
  } else if (token === ")") {
    throw new SyntaxError("Unexpected");
  } else {
    return atom(token);
  }
}

// <application>  ::=  (<expression>+)
// <expression>   ::=  <variable> | <literal>
// <variable>     ::=  [symbol]
// <literal>      ::=  [number] | [character] | [string] | #t | #f
Parser.prototype.parse = function () {
  function application() {}
  return appication();
};

//
// Environment
//

function Environment(encloding = null) {
  this.enclosing = enclosing;
  // Store bindings
  this.values = {};
}

Environment.prototype.define = function (name, value) {
  this.values[name] = value;
};

//
// Interpreter
//

function Interpreter() {
  this.globals = new Environment();
  this.environment = this.globals;

  function addNativeFuntions() {
    this.globals.define("+", function (a, b) {
      a + b;
    });
    this.globals.define("*", function (a, b) {
      a * b;
    });
  }
  addNativeFuntions();
}

Interpreter.prototype.interpret = function (expressions) {
  expressions.forEach(function (expression) {
    this.evaluate(expression);
  });
};

Interpreter.prototype.evaluate = function (expression) {
  if (typeof expression === "number") {
    return expression;
  } else {
    // syntax:  (<operator> <operand1> ...)
    // Procedure calls, e.g. (+ 3 4)
    let operatorExpr = expression[0];
    let operandExprs = expression.slice(1);
    let operator = this.evaluate(operatorExpr);
    let operands = operandExprs.forEach(function (operandExpr) {
      this.evaluate(operandExpr);
    });
    return operator.apply(operands);
  }
};

function run(source) {
  let tokens = tokenize(source);
  let parser = new Parser(tokens);
  let ast = parser.parse(tokens);
  let interpreter = new Interpreter();
  interpreter.interpret(ast);
}

// program = "(begin (define r 10) (* pi (* r r)))";
program = "(+ 1 2)";
program = "(+ 1 (* 2 3))";

run(program);

console.log(ast);
