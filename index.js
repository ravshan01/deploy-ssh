import path from 'path';
import { NodeSSH } from 'node-ssh';

export default async function deploy({
  hostIP,
  port,
  userName,
  userPassword,
  privateKey,
  privateKeyPath,
  passphrase,
  localPath,
  remotePath,
  concurrency = 7,
}) {
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host: hostIP,
      port,
      username: userName,
      password: userPassword,
      privateKey,
      privateKeyPath,
      passphrase,
    });

    const command = await ssh.execCommand(`rm -rf ${remotePath}/*`);
    console.log(`Start 'rm -rf ${remotePath}/*'`);
    console.log(command);

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
          console.log(err)
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
