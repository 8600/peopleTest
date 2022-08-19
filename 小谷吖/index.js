var amqp = require('amqplib');
var rabbitmq = {
  hostname: "rabbitmq.port.run",
  port: "5672",
  username: "小谷吖",
  password: "UFVbNHbVUkmb",
  authMechanism: "AMQPLAIN",
  pathname: "/",
  durable: true,
  ssl: {
    enabled: false
  }
}
const open = amqp.connect(rabbitmq)
var q = '小谷吖';
open.then(function(conn) {
  return conn.createChannel();
}).then(function(ch) {
  return ch.assertQueue(q, {durable: true}).then(function(ok) {
    return ch.consume(q, function(msg) {
      console.log(msg.content.toString())
    }, {noAck: true});
  });
}).catch(console.warn);