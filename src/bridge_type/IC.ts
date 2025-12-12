import { print, error, preview_text } from "../html"

type utag = "lam" | "bridge"
type btag = "app" | "annot" | "dup" | "sup"
type ztag = "var" | "era" | "root" | "unity"

export type Tag = utag | btag | ztag
export type PN = 0 | 1 | 2

export const MAIN: PN = 0
export const AUX1: PN = 1
export const AUX2: PN = 2

export type Nod = {
  tag: Tag
  label: number
  con: [Port, Port, Port]
}

export type Port = {
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

export const isterm = (p: Port) => negative_pol(p.node.tag, p.num)
export const other = (p: Port) => p.node.con[p.num]
export const wire = (ic: Port, other: Port)=> {
  if (isterm(ic) == isterm(other)) error("Cannot wire same polarity ports: ", ic, other)
  ic.node.con[ic.num] = other
  other.node.con[other.num] = ic
}


const erase = (era:Nod, app:Nod) => {
  print("erase", era.tag, app.tag)
  print(preview_text(era.con))
  print(preview_text(app.con[AUX1]))

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



const annihilate = (app:Nod, lam:Nod) => {
  print("annihilate")
  print(preview_text(app.con))
  print(preview_text(lam.con))
  if (app.con[AUX1] && lam.con[AUX1]) wire(app.con[AUX1], lam.con[AUX1])
  if (app.con[AUX2] && lam.con[AUX2]) wire(app.con[AUX2], lam.con[AUX2])
}





export const redex = (node:Nod):boolean => {

  if (node.con[MAIN].num != MAIN) return false

  let other = node.con[MAIN].node


  let tags =  node.tag + " " + other.tag

  if (node.tag == "era" && (other.tag == "app" || other.tag == "annot" || other.tag == "sup")) erase (node, other)
  else if (tags == "dup lam" || tags == "app sup") commute (node, other)
  else if (tags == "app lam" || tags == "annot bridge") annihilate (node, other)
  else return false

}


export const exec = (term: Port) => {

  let rt = root()
  wire(term, rt)

  while (true){
    let red = false
    for (let node of walk_node(term.node)){

      if (redex(node)) {
        print("FOUND")
        red = true
        break
      }
    }
    if (!red) break
  }
  return other(rt)
}


export const main = (node: Nod): Port => ({node, num: MAIN})
export const aux1 = (node: Nod): Port => ({node, num: AUX1})
export const aux2 = (node: Nod): Port => ({node, num: AUX2})
export const nod = (tag: Tag, label = null, con: [Port, Port, Port] = [null, null, null]): Nod =>{
  let res : Nod = {
    tag,
    label: label ?? (tag == "dup" || tag == "sup" ? labctr++ : 0),
    con: [null, null, null]
  }
  con.forEach((port, num : PN)=> (port == null) ? null : wire({node: res, num: num}, port));
  return res;
}

export const unit = (): Port => main(nod("unity"))
export const era = (): Port => main(nod("era"))
export const root = (): Port => main(nod("root"))

export const app = (f: Port, x: Port): Port => main(nod("app", 0, [f, x, root()]))
export const annot = (x: Port, T: Port): Port => main(nod("annot", 0, [x, T, root()]))


export function* walk_node (x:Nod, ctx: Set<Nod>= null) : Generator<Nod> {
  if (ctx == null) ctx = new Set()
  ctx.add(x)
  yield x
  for (let port of x.con){
    if (port == null || ctx.has(port.node)) continue
    yield* walk_node(port.node, ctx)
  }
}


for (let x of walk_node(unit().node)){
  print(x)
}


let labctr = 70;

const dups = (port: Port, label: number = null): [Port, Port] => {
  if (label == null) label = labctr++
  let d = nod("dup", label, [port, era(), era()])
  return [aux1(d), aux2(d)]
}

const UNode = (op: utag, fn: (x: Port) => Port): Port => {

  let x = unit()
  let bod = fn(x)
  let lam = nod("lam", 0, [root(), null, bod])
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

const Lam = (fn: (x: Port) => Port) => UNode("lam", fn)
const Bridge = (fn: (x: Port) => Port) => UNode("bridge", fn)

const view_term = (term: Port): string => {
  let {node, num} = term
  let {tag, label, con} = node
  let ctx = new Map<Nod, number>();
  let varname = (x:Nod) => "x" + ctx.set(x, ctx.get(x) ?? ctx.size).get(x)
  if (tag == "lam" || tag == "bridge"){
    if (num == AUX1) return varname(node)
    return `${tag == "lam" ? "λ" : "θ"}${ con[AUX1].node.tag == "era" ? "" : varname(node)}.${view_term(con[AUX2])}`
  }
  if (tag == "app") return `(${view_term(con[0])} ${view_term(con[1])})`
  if (tag == "annot") return `(${view_term(con[0])} : ${view_term(con[1])})`
  if (tag == "unity") return "()"
  if (tag == "era") return "*"
  if (tag == "root") return "@"
  return `[[${tag}]]`
}

const print_term = (term: Port) => print(view_term(term))



{

  let t = app(Lam((x:Port)=>unit()), unit())
  print_term(t)
  exec(t)
  print_term(t)
}


