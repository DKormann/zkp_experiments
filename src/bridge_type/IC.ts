import { print, error, preview_text } from "../html"

type utag = "lam" | "bridge"
type btag = "app" | "annot" | "dup" | "sup"
type ztag = "var" | "era" | "root" | "unity" | "type" | "Unit"

const ztags = ["var", "era", "root", "unity", "type", "Unit"]

export type Tag = utag | btag | ztag
export type PN = 0 | 1 | 2

export const MAIN: PN = 0
export const AUX1: PN = 1
export const AUX2: PN = 2

export type Nod = {
  tag: Tag
  label: number
  con: [Term, Term, Term]
}

export type Term = {
  node: Nod
  num: 0 | 1 | 2
}

export const negative_pol = (tag: Tag, num: number) =>{
  switch (tag){
    case "app": case "annot": return num == 2
    case "lam": case "bridge":  return num != 2
    case "sup" : return num == 0
    case "dup": return num != 0
    case "root": case "era": return false
    case "unity": return true
  }
}

export const isterm = (p: Term) => negative_pol(p.node.tag, p.num)
export const other = (p: Term) => p.node.con[p.num]
export const wire = (ic: Term, other: Term)=> {
  if (isterm(ic) == isterm(other)) error("Cannot wire same polarity ports: ", ic, other)
  ic.node.con[ic.num] = other
  other.node.con[other.num] = ic
}


const erase = (era:Nod, app:Nod) => {
  // print("erase", era.tag, app.tag)
  // print(preview_text(era.con))
  // print(preview_text(app.con[AUX1]))

  wire({node:{...era}, num:MAIN}, app.con[AUX1])
  wire({node:{...era}, num:MAIN}, app.con[AUX2])
}


const commute = (dup:Nod, lam:Nod) => {
  if (lam.con[AUX1] == null || lam.con[AUX2] == null) throw new Error("Lam has no aux1 or aux2")
  let tags = [dup.tag, lam.tag]
  let d2tag = tags[0] == "dup" ? "sup" : dup.tag
  let l2tag = tags[1] == "app" ? "dup" : lam.tag
  let new_ : Nod[][] = [[{...dup}, {...dup, tag:d2tag}], [{...lam}, {...lam, tag:l2tag}]]
  wire({node:new_[0][0], num:0}, lam.con[2])
  wire({node:new_[0][1], num:0}, lam.con[1])
  wire({node:new_[1][0], num:0}, dup.con[2])
  wire({node:new_[1][1], num:0}, dup.con[1])
  wire({node:new_[1][0], num:1}, {node:new_[0][1], num:2})
  wire({node:new_[1][0], num:2}, {node:new_[0][0], num:2})
  wire({node:new_[1][1], num:1}, {node:new_[0][1], num:1})
  wire({node:new_[1][1], num:2}, {node:new_[0][0], num:1})
}



let node_view = (node:Nod) => `${node.tag}(${node.con.filter(c=>c).map(c=>c.node.tag).join(", ")})`

const annihilate = (app:Nod, lam:Nod) => {
  if (app.con[AUX1] && lam.con[AUX1]) wire(app.con[AUX1], lam.con[AUX1])
  if (app.con[AUX2] && lam.con[AUX2]) wire(app.con[AUX2], lam.con[AUX2])
}


export const redex = (node:Nod):boolean => {

  if (node.con[MAIN].num != MAIN) return false

  let other = node.con[MAIN].node
  let tags =  node.tag + " " + other.tag

  let handler =
  (node.tag == "era" && (other.tag == "app" || other.tag == "annot" || other.tag == "sup")) ? erase :
  (tags == "dup lam" || tags == "app sup") ? commute :
  (tags == "app lam" || tags == "annot bridge") ? annihilate :
  null

  if (handler == null) return false
  // print("handler", tags)
  handler(node, other);
  return true


}


export const exec = (term: Term) => {

  let rt = root()
  wire(term, rt)

  while (true){
    let red = false
    for (let node of walk_node(rt.node)){

      if (redex(node)) {
        red = true
        break
      }
    }
    if (!red) break
  }
  return other(rt)
}


export const main = (node: Nod): Term => ({node, num: MAIN})
export const aux1 = (node: Nod): Term => ({node, num: AUX1})
export const aux2 = (node: Nod): Term => ({node, num: AUX2})
export const nod = (tag: Tag, label = null, con: [Term, Term, Term] = [null, null, null]): Nod =>{
  let res : Nod = {
    tag,
    label: label ?? (tag == "dup" || tag == "sup" ? labctr++ : 0),
    con: [null, null, null]
  }
  con.forEach((port, num : PN)=> (port == null) ? null : wire({node: res, num: num}, port));
  return res;
}

export const unit = (): Term => main(nod("unity"))
export const Unit = (): Term => main(nod("Unit"))
export const era = (): Term => main(nod("era"))
export const root = (): Term => main(nod("root"))

export const app = (f: Term, ...x: Term[]): Term => x.reduce((acc, x) => exec(aux2(nod("app", 0, [acc, x, root()]))), f)
export const annot = (x: Term, T: Term): Term => 
  aux2(nod("annot", 0, [x, T, root()]))


export function* walk_node (x:Nod, ctx: Set<Nod>= null) : Generator<Nod> {
  if (ctx == null) ctx = new Set()
  ctx.add(x)
  yield x
  for (let port of x.con){
    if (port == null || ctx.has(port.node)) continue
    yield* walk_node(port.node, ctx)
  }
}



let labctr = 70;

const dups = (port: Term, label: number = null): [Term, Term] => {
  if (label == null) label = labctr++
  let d = nod("dup", label, [port, era(), era()])
  return [aux1(d), aux2(d)]
}

const UNode = (op: utag, fn: (x: Term) => Term): Term => {

  let x = unit()
  let bod = fn(x)
  let lam = nod(op, 0, [root(), null, bod])
  let bindr = aux1(lam)
  let prev = null

  for (let node of walk_node(lam)){

    node.con.forEach((port, num : PN)=>{
      if (port == null || (port.node == lam && port.num == AUX1)) return
      if (port.node == x.node){
        let cur = {node, num}
        if (prev == null){
          prev = cur
          wire(prev, bindr)
        }else{
          let [d1, d2] = dups(bindr)
          wire(prev, d1)
          wire(cur, d2)
          prev = {node: d1.node, num: MAIN}
        }
      }
    })
  }

  if (lam.con[AUX1] == null) wire(aux1(lam), era())
  return main(lam);

}

const Lam = (fn: (x: Term) => Term) => UNode("lam", fn)
const Bridge = (fn: (x: Term) => Term) => UNode("bridge", fn)

const view_term = (term: Term, ctx: Map<Nod, number> = null): string => {
  let {node, num} = term
  let {tag, label, con} = node
  ctx = ctx ?? new Map<Nod, number>();
  let varname = (x:Nod) => {
    let i = ctx.set(x, ctx.get(x) ?? ctx.size).get(x);
    return i > 26 ?  String.fromCharCode(i/26 + 96) : "" + String.fromCharCode(i%26 + 97);
  }
  if (tag == "lam" || tag == "bridge"){
    if (num == AUX1) return varname(node)
    return `${tag == "lam" ? "λ" : "θ"}${ con[AUX1].node.tag == "era" ? "" : varname(node)}.${view_term(con[AUX2], ctx)}`
  }
  if (tag == "app") return `(${view_term(con[0], ctx)} ${view_term(con[1], ctx)})`
  if (tag == "annot") return `{${view_term(con[0], ctx)} : ${view_term(con[1], ctx)}}`
  if (tag == "unity") return "()"
  if (tag == "era") return "*"
  if (tag == "root") return "@"
  if (tag == "Unit") return "Unit"
  return `[[${tag}]]`
}

const print_term = (term: Term) => print(view_term(term))



if (0){
  
  let t = app(Lam((x:Term)=>x), Lam((x:Term)=>x))
  t = annot(Bridge((x:Term)=>x), unit())
  print_term(t)
  print(t)
  
  print_term(t)
  t = exec(t)
  print_term(t)
}




const Fun = () => Lam((A: Term) => Lam((B: Term) => Bridge((f: Term) => Lam((x: Term) =>
  annot(app(f, annot(x, A)), B)
))))





let ann = (t: Term, T: Term) => {
  let at = annot(T, t)
  let p = view_term(at)
  at = exec(at)

  let r = view_term(at)
  print(p + " ~> " + r)
  return (p + " ~> " + r)
}



let T = () => app(Fun(), Unit(), Unit())


print([view_term(T()), ann(unit(), T()), ann(Lam((x: Term) => x), T())].join("\n"))
