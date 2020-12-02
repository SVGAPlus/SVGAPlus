extern crate wasm_bindgen;
extern crate bincode;
extern crate serde;

mod lib_test;
mod svga;

use std::fs::File;
use std::mem;
use wasm_bindgen::prelude::*;
use std::convert::TryFrom;
use svga::{
  MovieEntity
};

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
  let movie: MovieEntity = bincode::deserialize(bytes)
    .expect("failed to deserialize MovieEntity");
  return movie;
}
