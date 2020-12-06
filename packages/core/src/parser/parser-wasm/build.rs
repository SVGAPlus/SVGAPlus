use std::env;
use protoc_rust::Customize;

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
