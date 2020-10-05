// Take the string represenation of the program
// Outputs a list of tokens in that string
// A Token is an indivisible syntactic unit
// Tokens are seperated by whitespace(spaces, tabs, newlines)
class Tokenizer {
  constructor(chars) {
    this.chars = chars;
  }

  tokenize() {
    return this.chars
      .replace(/\(/g, " ( ")
      .replace(/\)/g, " ) ")
      .trim()
      .split(/\s+/);
  }
}

// A parser structures the tokens according to the program structure,
// producing a parse tree that encodes the structure of the input program (AST)
// Paranthesis provide the program structure, so are removed from the parse tree
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  //program -> listExp *
  parse() {
    console.log("tokens", this.tokens);
    let list = [];
    while (this.hasMoreTokens()) {
      // console.log("list", this.listExp());
      list.push(this.listExp());
    }
    return list;
  }

  // listExp -> '(' s_expression * ')'
  listExp() {
    this.consume("(");
    let list = [];
    while (this.peek() !== ")") {
      this.consume(")");
      list.push(this.sExpression());
    }
    this.consume(")");
    return list;
  }

  // s_expression ->  atom | list
  sExpression() {
    if (this.check("(")) {
      return this.listExp();
    } else {
      return this.atom();
    }
  }

  // atom -> number | string
  atom(token) {
    token = this.advance();
    let numVal = Number(token);
    if (numVal) {
      return numVal;
    }
    return token;
  }

  consume(tokeType) {
    if (this.check(tokeType)) {
      return this.advance();
    }
  }

  check(token) {
    if (!this.hasMoreTokens()) {
      return false;
    }
    return this.peek() === token;
  }

  peek(ll = 0) {
    return this.tokens[this.current + ll];
  }

  advance() {
    if (this.hasMoreTokens()) {
      this.current++;
    }
    return this.tokens[this.current - 1];
  }

  hasMoreTokens() {
    return this.current < this.tokens.length - 1;
  }
}

// Handle variable look up
class Environment {
  constructor(params = [], args = [], enclosing = null) {
    this.env = {};
    params.forEach((param, i) => this.define(param, args[i]));
    this.enclosing = enclosing;
    this.interpreter = null;
  }

  define(name, value) {
    this.env[name] = value;
  }

  // Get the val from the innermost env where var(name) appears
  get(name) {
    console.log("look for", name, "in", this.env);

    let lookupVal = this.env[name];
    if (lookupVal) {
      return lookupVal;
    }

    if (this.enclosing === null) {
      throw new Error(`Could not found symbol ${name}`);
    }

    return this.enclosing.get(name);
  }
}

// A user defined Scheme procedure
class Procedure {
  constructor(params, body, definitionEnv) {
    this.params = params;
    this.body = body;
    this.definitionEnv = definitionEnv;
    this.interpreter = this.definitionEnv.interpreter;
  }

  call(...args) {
    console.log("Proc call with", args);
    this._setEvalutionEnv(...args);
    return this.interpreter.eval(this.body);
  }

  // Create new env/context for the evaluation -- defintion env as the parent
  _setEvalutionEnv(args) {
    console.log("args", args);
    this.interpreter.env = new Environment(
      this.params,
      args,
      this.definitionEnv
    );
  }
}

class Interpreter {
  constructor() {
    this.globals = new Environment();
    this._addNativeFunctions();
    this.env = this.globals;
    this.env.interpreter = this;
  }

  interpret(expressions) {
    return expressions.map((expression) => this.eval(expression)).pop();
  }

  eval(expression) {
    console.log("expression", expression);
    // Variable reference
    if (typeof expression === "string") {
      return this.symbol(expression);
    }

    if (typeof expression === "number") {
      return this.number(expression);
    }

    let [op, ...args] = expression;

    // conditional
    if (op === "if") {
      let [test, if_body, else_body] = args;
      let exp = this.eval(test) ? if_body : else_body;
      return this.eval(exp);
    }

    // definition
    if (op === "define") {
      let [symbol, exp] = args;
      return this.env.define(symbol, this.eval(exp));
    }

    // procedure call
    if (op === "lambda") {
      console.log("Eval lambda");
      let [params, body] = args;
      return new Procedure(params, body, this.env);
    }

    return this.procCall(expression);
  }

  symbol(expression) {
    return this.env.get(expression);
  }

  number(expression) {
    return expression;
  }

  // (proc args...)
  // Evaluate proc and all the args
  // apply proc to the args values
  procCall(expression) {
    console.log("procCall", expression);
    let procObj = this.eval(expression[0]);
    let args = [];
    expression.slice(1).forEach((arg) => {
      args.push(this.eval(arg));
    });
    console.log("procObj", procObj);
    if (typeof procObj === "function") {
      return procObj.apply(null, args);
    }
    return procObj.call(args);
  }

  _addNativeFunctions() {
    this.globals.define("+", (a, b) => a + b);

    this.globals.define("-", (a, b) => a - b);

    this.globals.define("*", (a, b) => a * b);

    this.globals.define("<=", (a, b) => a <= b);

    this.globals.define("list", function (...args) {
      return args;
    });

    this.globals.define("first", function (list) {
      return list[0];
    });

    this.globals.define("begin", function (...args) {
      return args[args.length - 1];
    });

    this.globals.define("pi", Math.PI);
  }
}

function run(source) {
  let tokens = new Tokenizer(source).tokenize(source);
  let parser = new Parser(tokens);
  let ast = parser.parse(tokens);
  console.log("AST", ast);
  let interpreter = new Interpreter();
  let result = interpreter.interpret(ast);
  console.log("RES", result);
  return result;
}

function test(program, output) {
  if (JSON.stringify(run(program)) === JSON.stringify(output)) {
    console.log("CORRECT");
  } else {
    console.log("FAILED");
  }
}

function testEval() {
  // program = "(+ 1 2)";
  // test(program, 3);
  // program = "(+ 1 (* 2 3))";
  // test(program, 7);
  // program = "(first (list 1 (+ 2 3) 9))";
  // test(program, 1);
  // program = "(begin (define r 10) (* pi (* r r)))";
  // test(program, 100 * Math.PI);
  program = "(define circle-area (lambda (r) (* pi (* r r)))) (circle-area 3)";
  program = "(define twice (lambda (x) (* 2 x))) (twice 5)";
  program =
    "(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1)))))) (fact 10)";
  test(program, 3628800);
}

testEval();
