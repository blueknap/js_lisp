# A lisp interpreter in JS
http://norvig.com/lispy.html

Scheme programs consist solely of expresions
- Number and Symbols are called atomic expressions; they can not be broken into pieces
- Operators are symbols too, e.g. -- +, >, -
- Everyting else is a list expression
  - A list starting with an keyword, e.g. (if ...), is a special form; the meaining depens on the keyword
  - A list starting with a non-keyword, e.g. (fn ...),  is a funcion call



