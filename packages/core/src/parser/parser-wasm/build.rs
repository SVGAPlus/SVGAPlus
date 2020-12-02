extern crate protoc_rust;

use protoc_rust::Customize;

fn main() {
  protoc_rust::Codegen::new()
    .out_dir("src")
    .inputs(&["protos/svga.proto"])
    .include("protos")
    .customize(Customize {
      serde_derive: Some(true),
      ..Default::default()
    })
    .run()
    .expect("protoc");
}
