extern crate protobuf_codegen_pure;
extern crate protoc_rust;

use std::env;
use protobuf_codegen_pure::Customize;

fn main() {
  protoc_rust::Codegen::new()
    .customize(Customize {
      gen_mod_rs: Some(true),
      ..Default::default()
    })
    .out_dir("src/protos")
    .inputs(&["protos/svga.proto"])
    .include("protos")
    .run()
    .expect("no protoc in path");
}
