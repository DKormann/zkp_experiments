import { print } from "./html"


const sized = (...code: (number | number[])[]) =>{
  let fl = code.flat()
  return [fl.length, ...fl]
} 


export const repeat = <T> (length:number, ...value:T[]) : Array<T> => Array.from({length}, _=>value).flat()

const wasm = {
  header: [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00],
  section: {
    type: 0x01,
    function: 0x03,
    export: 0x07,
    code: 0x0a,
    data: 0x0b,
    import: 0x09,
    start: 0x08,
    element: 0x09,
    table: 0x04,
    memory: 0x05,
    global: 0x06,
  },
  dtypes: {
    i32: 0x7f,
    i64: 0x7e,
    f32: 0x7d,
    f64: 0x7c,
    func: 0x60,
  },
  ops: {
    i32:{
      add: 0x6a,
      sub: 0x6d,
      mul: 0x6b,
      div: 0x6f,
      idiv: 0x6f,
      mod: 0x6f,
      get: 0x20,
      set: 0x21,
      tee: 0x22,
      div_s: 0x6f,
      const: 0x41,
      load: 0x28,
      store: 0x36
    },
    end: 0x0b,
    block: 0x02,
    loop: 0x03,
    br: 0x0c,
    br_if: 0x0d,
    return: 0x0f,
    call: 0x10,
  },
  string:(s:string) => sized(s.split("").map(c=>c.charCodeAt(0))),
}

type Binop = "add" | "sub" | "mul" | "div" | "mod" | "and" | "or" | "xor" | "shl" | "shr" | "sar"

type wasmCode = {
  op: "local", idx: number
} | {
  op: Binop, args: [wasmCode, wasmCode]
}

type WasmPrimType = "i32" | "i64" | "f32" | "f64"

type Func = {
  name: string,
  export? : true,
  args: WasmPrimType[],
  return: WasmPrimType[],
  code: wasmCode
}

const compile = (fs : Func[]) => {

  let section = (tag: [keyof typeof wasm.section][0], parts: (number[])[]) => {
    let code = [parts.length, ...parts.flat()]
    return [wasm.section[tag], code.length, ...code]
  }

  let types = section("type", fs.map(f=>[wasm.dtypes.func,
    ...[f.args, f.return].map(c => sized(c.map(a=>wasm.dtypes[a]))).flat()]))
  let funcs = section("function", fs.map((f,i)=>[i]))
  let exps = fs.map((f,i)=>[f,i] as [Func, number]).filter(([f,i])=>f.export)
  let exports = section("export", exps.map(([f,i])=>[...wasm.string(f.name), 0x00, i]))

  let raster = (f: wasmCode):number[] =>
    f.op === "local" ? [wasm.ops.i32.get, f.idx] : [f.args.map(raster).flat(), wasm.ops.i32[print(f.op)]].flat()

  let code = section("code", fs.map((f)=>sized([0, ...raster(f.code), wasm.ops.end])))
  return [ wasm.header, types, funcs, exports, code ]
}

let bf = compile([{
    name: "main",
    export: true,
    args: ["i32", "i32"],
    return: ["i32"],
    code: {
      op: "add",
      args: [{op: "local", idx: 0}, {op: "local", idx: 1}]
    }
  }
])

bf.map(b=>print(b.map(b=>b.toString(16)).join(" ")))

let as = (await WebAssembly.instantiate(Uint8Array.from(bf.flat()).buffer)).instance.exports.main as (x:number, y:number) => [number, number]
print(as)
print(as(1, 2))


