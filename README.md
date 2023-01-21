# IPFS STORAGE API PROVIDERS

<img alt="IPFS STORAGE API PROVIDERS" src="https://raw.githubusercontent.com/alexbakers/ipfs-storage/main/banner.png" />

- [x] Filebase [<a href="https://filebase.com">filebase.com</a>]
- [x] Fleek [<a href="https://fleek.co">fleek.co</a>]
- [x] Web3 [<a href="https://web3.storage">web3.storage</a>]
- [x] Pinata [<a href="https://pinata.cloud">pinata.cloud</a>]
- [x] Lighthouse [<a href="https://lighthouse.storage">lighthouse.storage</a>]

## Examples

### FILEBASE

```javascript
fs.readFile(join(__dirname, "..", "banner.png"), async (err, data) => {
  if (err) {
    console.log("🆘 ERROR:", err);
    return;
  }

  if (!process.env.FILEBASE_KEY) {
    console.log("🆘 ERROR:", "Create .env file");
    return;
  }

  try {
    const url = await uploadFile.filebase(
      {
        key: process.env.FILEBASE_KEY,
        secret: process.env.FILEBASE_SECRET,
        bucket: process.env.FILEBASE_BUCKET,
      },
      {
        hash: "banner",
        ext: ".png",
        buffer: data,
      }
    );
    console.log("✅ FILEBASE:", url);
    await deleteFile.filebase(
      {
        key: process.env.FILEBASE_KEY,
        secret: process.env.FILEBASE_SECRET,
        bucket: process.env.FILEBASE_BUCKET,
      },
      {
        hash: "banner",
        ext: ".png",
      }
    );
  } catch (err) {
    console.log("🆘 FILEBASE:", err);
  }
});
```

### PINATA

```javascript
fs.readFile(join(__dirname, "..", "banner.png"), async (err, data) => {
  if (err) {
    console.log("🆘 ERROR:", err);
    return;
  }

  if (!process.env.PINATA_JWT) {
    console.log("🆘 ERROR:", "Create .env file");
    return;
  }

  try {
    const url = await uploadFile.pinata(
      {
        jwt: process.env.PINATA_JWT,
      },
      {
        hash: "banner",
        ext: ".png",
        buffer: data,
      }
    );
    console.log("✅ PINATA:", url);
    await deleteFile.pinata(
      {
        jwt: process.env.PINATA_JWT,
      },
      {
        url,
      }
    );
  } catch (err) {
    console.log("🆘 PINATA:", err);
  }
});
```

### FLEEK

```javascript
fs.readFile(join(__dirname, "..", "banner.png"), async (err, data) => {
  if (err) {
    console.log("🆘 ERROR:", err);
    return;
  }

  if (!process.env.FLEEK_KEY) {
    console.log("🆘 ERROR:", "Create .env file");
    return;
  }

  try {
    const url = await uploadFile.fleek(
      {
        key: process.env.FLEEK_KEY,
        secret: process.env.FLEEK_SECRET,
        bucket: process.env.FLEEK_BUCKET,
      },
      {
        hash: "banner",
        ext: ".png",
        buffer: data,
      }
    );
    console.log("✅ FLEEK:", url);
    await deleteFile.fleek(
      {
        key: process.env.FLEEK_KEY,
        secret: process.env.FLEEK_SECRET,
        bucket: process.env.FLEEK_BUCKET,
      },
      {
        hash: "banner",
        ext: ".png",
      }
    );
  } catch (err) {
    console.log("🆘 FLEEK:", err);
  }
});
```

### WEB3

```javascript
fs.readFile(join(__dirname, "..", "banner.png"), async (err, data) => {
  if (err) {
    console.log("🆘 ERROR:", err);
    return;
  }

  if (!process.env.WEB3_TOKEN) {
    console.log("🆘 ERROR:", "Create .env file");
    return;
  }

  try {
    const url = await uploadFile.web3(
      {
        token: process.env.WEB3_TOKEN,
      },
      {
        hash: "banner",
        ext: ".png",
        buffer: data,
      }
    );
    console.log("✅ WEB3:", url);
    await deleteFile.web3(
      {
        token: process.env.WEB3_TOKEN,
      },
      {
        url,
      }
    );
  } catch (err) {
    console.log("🆘 WEB3:", err);
  }
});
```

### LIGHTHOUSE

```javascript
fs.readFile(join(__dirname, "..", "banner.png"), async (err, data) => {
  if (err) {
    console.log("🆘 ERROR:", err);
    return;
  }

  if (!process.env.LIGHTHOUSE_TOKEN) {
    console.log("🆘 ERROR:", "Create .env file");
    return;
  }

  try {
    const url = await uploadFile.lighthouse(
      {
        token: process.env.LIGHTHOUSE_TOKEN,
      },
      {
        hash: "banner",
        ext: ".png",
        buffer: data,
      }
    );
    console.log("✅ LIGHTHOUSE:", url);
    await deleteFile.lighthouse(
      {
        token: process.env.LIGHTHOUSE_TOKEN,
      },
      {
        url,
      }
    );
  } catch (err) {
    console.log("🆘 LIGHTHOUSE:", err);
  }
});
```

---

`(c)` Alex Baker
