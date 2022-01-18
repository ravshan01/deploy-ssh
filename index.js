const path = require("path");
const { NodeSSH } = require("node-ssh");

export default async function deploy({
  hostIP,
  userName,
  userPassword,
  localPath,
  remotePath,
}) {
  const ssh = new NodeSSH();
  const failed = [];
  const successFul = [];

  try {
    await ssh.connect({
      host: hostIP,
      username: userName,
      password: userPassword,
    });

    const status = await ssh.putDirectory(localPath, remotePath, {
      recursive: true,
      concurrency: 3,
      validate: itemPath => {
        const baseName = path.basename(itemPath);
        return (
          baseName.substring(0, 1) !== "." && // do not allow dot files
          baseName !== "node_modules" // do not allow node_modules
        );
      },
      tick: (localPath, remotePath, err) => {
        if (err) {
          failed.push(localPath);
        } else successFul.push(localPath);
      },
    });

    console.log("the directory transfer was", status ? "successful" : "unsuccessful");
    console.log("failed transfers", failed.join(", "));
    console.log("successful transfers", successFul.join(", "));
  } catch (err) {
    console.log(err);
  }

  process.exit();
}
