use std::{
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:3001").unwrap();
    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream)
    }
}

fn handle_connection(mut stream: TcpStream) {
    let peer_ip = stream.peer_addr().unwrap();
    let buf_reader = BufReader::new(&mut stream);
    let http_request_lines: Vec<String> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    let x_forwrded_for = match http_request_lines
        .clone()
        .into_iter()
        .find(|line| line.starts_with("X-Forwarded-For") || line.starts_with("x-forwarded-for"))
    {
        Some(line) => {
            let (_, value) = parse_http_field(&line).unwrap();
            Some(value)
        }
        None => None,
    };

    let request_line = &http_request_lines[0];

    let contents = match x_forwrded_for {
        Some(x) => format!("{x}"),
        None => format!("{peer_ip}"),
    };

    if !request_line.starts_with("GET") {
        let response = "HTTP/1.1 405 MethodNotFound\r\n\r\n";
        stream.write_all(response.as_bytes()).unwrap();
        return;
    } else if request_line == "GET / HTTP/1.1" {
        let length = contents.len();
        let response = format!("HTTP/1.1 200 OK\r\ncontent-length: {length}\r\n\r\n{contents}");
        stream.write_all(response.as_bytes()).unwrap();
    } else {
        let response = "HTTP/1.1 404 NotFound";
        stream.write_all(response.as_bytes()).unwrap();
    }
}

fn parse_http_field(line: &str) -> Option<(String, String)> {
    let mut parts = line.splitn(2, ':');
    let key = parts.next()?.trim().to_string();
    let value = parts.next()?.trim().to_string();
    Some((key, value))
}
