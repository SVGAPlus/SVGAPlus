#[cfg(test)]
mod lib_test {
  use std::fs;
  use protobuf::parse_from_bytes;
  use inflate::inflate_bytes_zlib;

  use crate::protos::svga::MovieEntity;
  use crate::decode_svga;

  #[test]
  fn test_decode () {
    let test_file_name = "test.svga";
    let test_file_buffer = fs::read(test_file_name)
      .expect("failed to read test.svga");

    let movie = decode_svga(&test_file_buffer);
    assert_eq!(movie.version, String::from("2.1.0"));

    let sprites = movie.sprites.to_vec();
    assert_eq!(sprites.len(), 11);

    let images = movie.images;
    assert_eq!(images["img_2509"].len(), 81393);
  }
}
