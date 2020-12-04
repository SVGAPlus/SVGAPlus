#[cfg(test)]
mod lib_test {
  use std::fs;
  use protobuf::{
    parse_from_bytes
  };

  use crate::protos::svga::{
    MovieEntity
  };

  #[test]
  fn test_decode () {
    let test_file_name = "test.svga";

    let test_file_buffer = fs::read(test_file_name)
      .expect("failed to read test.svga");

    let movie = parse_from_bytes::<MovieEntity>(&test_file_buffer)
      .expect("failed to parse");

    println!("{:?}", &movie);
  }
}
