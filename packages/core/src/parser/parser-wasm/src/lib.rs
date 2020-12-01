use std::fs::File;

extern crate wasm_bindgen;
extern crate protobuf;

use wasm_bindgen::prelude::*;
use protobuf::{
  Message, parse_from_bytes, ProtobufResult
};

use crate::svga::{
  MovieEntity, file_descriptor_proto
};

mod svga;
mod lib_test;

#[wasm_bindgen]
extern {
  #[wasm_bindgen(js_namespace = console)]
  fn log (content: &str);
}

macro_rules! console_log {
  // Note that this is using the `log` function imported above during
  // `bare_bones`
  ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// #[wasm_bindgen]
pub fn decode(bytes: &[u8]) -> MovieEntity {
  let movie = parse_from_bytes::<MovieEntity>(bytes)
    .expect("failed to parse movie entity");
  return movie;
}
