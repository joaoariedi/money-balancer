FROM rust:1.64.0-alpine3.16 as build

WORKDIR /build
COPY . .
RUN cargo fetch
RUN apk add --no-cache build-base nodejs yarn pkgconfig openssl-dev
RUN cargo build --release

FROM alpine:3.16
RUN apk add --no-cache sqlite
WORKDIR /data
ENV ROCKET_ADDRESS=0.0.0.0
ENV ROCKET_PORT=8000
COPY --from=build /build/target/release/money-balancer /money-balancer
COPY run-migrations.sh /run-migrations.sh
RUN chmod +x /run-migrations.sh
EXPOSE 8000
VOLUME [ "/data" ]
ENTRYPOINT ["/run-migrations.sh"]