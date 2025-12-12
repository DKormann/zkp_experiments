import { canvas, p, plot, print, print as print_html, style } from "../html";


import "./IC"

import { AUX2, MAIN, Nod, Port, Tag } from "./IC";

// The most compelling aspect of ICC is how simple, yet powerful, it is. The current implementation is less than 100 lines on HVM, making it much smaller than the Calculus of Constructions, and probably the simplest proof checker in the world. Yet, despite its simplicity, the ICC is extremely powerful. By using its only type former, the bridge (`θx T`), we can derive not just CoC's dependent function type (`Π(x: A) B[x]`), but many other types not available in it, like inductive functions, quotients and so on. Here are some examples:

// // Simple Function. Syntax: !A -> B
// Fun = λA λB θf λx {(f {x: A}): B}

// // Dependent Function. Syntax: Π(x: A) B[x]
// All = λA λB θf λx {(f {x: A}): (B x)}

// // Inductive Function. Syntax: $f(x: A) B[f,x]
// Ind = λA λB θf λx {(f {x: A}): (B f x)}

// // Dependent Pair. Syntax: Σ(x: A) B[x]
// Sig = λA λB θp {(p {p.0: A} {p.1: (B p.0)})}
// type Op =  "var"

// type zop = "var"
// type uop = "lam" | "bridge"
// type binop = "app" | "annot"

// type ZAst = [zop]
// type UAst = [uop, ZAst, Ast]
// type BinAst = [binop, Ast, Ast]
// type Ast = ZAst | UAst | BinAst



// const vr = (): ZAst => ["var"]


// const UAst = (op:uop, fn: (x: Ast) => Ast): UAst => {
//   let v = vr();
//   return [op, v, fn(v)]
// }





// const Lam = (fn: (x: Ast) => Ast) => UAst("lam", fn)
// const Bridge = (fn: (x: Ast) => Ast) => UAst("bridge", fn)

// const Bin = (op: binop, A: Ast, B: Ast): BinAst => [op, A, B]
// const App = (f: Ast, x: Ast) => Bin("app", f, x)
// const Annot = (x: Ast, T: Ast) => Bin("annot", x, T)




// const Fun = Lam((A: Ast) => Lam((B: Ast) => Bridge((f: Ast) => Lam((x: Ast) =>
//   Annot(App(f, Annot(x, A)), App(App(B, f), x))))))

// const isfun = ([op]: Ast): boolean => op == "lam" || op == "bridge"
// const isbin = ([op]: Ast): boolean => op == "app" || op == "annot"


// const view = (x: Ast) => {
//   let ctx = new Map<ZAst, number>();
//   let varname = (x:ZAst) => "x" + ctx.set(x, ctx.get(x) ?? ctx.size).get(x)

//   let go = (x: Ast) => {

//     let [op, ...args] = x;

//     switch (op){
//       case "var": return varname(x as ZAst);
//       case "lam": case "bridge": return `${op == "lam" ? "λ" : "θ"}${varname(args[0] as ZAst)}.${go(args[1])}`
//       case "app": return "(" + go(args[0]) + " " + go(args[1]) + ")"
//       case "annot": return "{" + go(args[0]) + " : " + go(args[1]) + "}"
//     }
//   }
//   return go(x);
// }

// const reduce = (x: Ast, ctx: Map<ZAst, Ast> = null): Ast => {
//   if (ctx == null) ctx = new Map();

//   let [op, ...args] = x;
//   if (op == "lam" || op == "bridge") return [op, args[0], reduce(args[1])] as UAst;
//   if (op == "app"){
//     let [f, x] = args;

//     let [fop, ...fargs] = f;
//     if (fop == "lam"){ 
//       let [x, body] = fargs as [ZAst, Ast];
//       ctx.set(x, reduce(x, ctx));
//       let ret = reduce(body, ctx);
//       ctx.delete(x);
//       return ret;
//     }

//   }

// }

// const print = (x: Ast) => print_html(view(x))


// print(Fun)

// // print_html(Fun)


