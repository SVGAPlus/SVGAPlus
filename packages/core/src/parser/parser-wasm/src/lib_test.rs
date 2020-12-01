#[cfg(test)]
mod lib_test {
  use std::fs;
  use crate::decode;
  use std::fs::File;
  use std::io::Read;

  #[test]
  fn test_decode () {
    let test_file_name = "test.svga";
    let test_file_buffer = fs::read(test_file_name)
      .expect("failed to read test file");
    let movie = decode(&test_file_buffer);
    println!("{:?}", &movie);
  }
}
