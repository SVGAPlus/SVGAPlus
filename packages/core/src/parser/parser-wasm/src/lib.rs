// extern crate wasm_bindgen;

mod lib_test;
mod protos;

use wasm_bindgen::prelude::*;
use wasm_bindgen::__rt::std::io::BufReader;
use inflate::inflate_bytes_zlib;
use protobuf::parse_from_bytes;

use crate::protos::svga::MovieEntity;

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
pub fn decode_svga(svga_bytes: &[u8]) -> MovieEntity {
  let decoded_bytes = inflate_bytes_zlib(&svga_bytes)
    .expect("failed to inflate svga file");
  let movie = parse_from_bytes::<MovieEntity>(&decoded_bytes)
    .expect("failed to parse MovieEntity");
  return movie;
}
