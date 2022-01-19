const path = require("path");
const { NodeSSH } = require("node-ssh");

export default async function deploy({
  hostIP,
  userName,
  userPassword,
  localPath,
  remotePath,
  concurrency = 7,
}) {
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host: hostIP,
      username: userName,
      password: userPassword,
    });

    const status = await ssh.putDirectory(localPath, remotePath, {
      recursive: true,
      concurrency: concurrency,
      validate: itemPath => {
        const baseName = path.basename(itemPath);
        return (
          baseName.substring(0, 1) !== "." && // do not allow dot files
          baseName !== "node_modules" // do not allow node_modules
        );
      },
      tick: (localPath, remotePath, err) => {
        if (err) {
          console.log(localPath, " failed");
        } else {
          console.log(localPath, " successful");
        }
      },
    });

    console.log("the directory transfer was", status ? "successful" : "unsuccessful");
  } catch (err) {
    console.log(err);
  }

  process.exit();
}
