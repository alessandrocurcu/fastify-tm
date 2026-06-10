Varlock includes a built-in [`varlock()` function](https://varlock.dev/reference/functions/#varlock) that lets you secure local untracked secrets (typically in git-ignored env files like `.env.local`).

This allows you to keep **everything out of plaintext** - even temporary local overrides, or a “secret-zero” which is needed by some plugins to load the rest of your sensitive data.

Sensitive values will be stored _encrypted_, with the key linked to your local device, and requiring no extra configuration. The encryption mechanism varies per platform, but as it is tied to your device, **these values are not meant to be shared or committed to git**.

```
PLAINTEXT=shh-im-secret            # 🚨 dangerSECURED=varlock(local:abc123...)  # ✅ secured at rest
```

## Quick start - existing secrets

[Section titled “Quick start - existing secrets”](https://varlock.dev/guides/local-encryption/#quick-start---existing-secrets)

You likely already have some plaintext secrets in a `.env.local` file. If not you can create one, and add some. Ensure those items are marked as [`@sensitive`](https://varlock.dev/reference/item-decorators/#sensitive) in your schema. Then you can use [`varlock encrypt`](https://varlock.dev/reference/cli-commands/#encrypt) to encrypt them in-place:

1.  Run `varlock encrypt --file .env.local` to encrypt them in-place
2.  Sensitive plaintext values are replaced with `varlock("local:<***encrypted***>")`
3.  Decryption happens automatically during `varlock load` / `varlock run`

Only plaintext values of `@sensitive` items are encrypted, so you may run it multiple times.

## Using `varlock(prompt)` resolver

[Section titled “Using varlock(prompt) resolver”](https://varlock.dev/guides/local-encryption/#using-varlockprompt-resolver)

When you need to edit a value or add a new sensitive item, just set the value to `varlock(prompt)` and run `varlock load`. You will be prompted for the new value in a secure input prompt, and the encrypted value will be written back to the file automatically.

```
EXISTING_ITEM=varlock(local:abc123...)NEW_ITEM=varlock(prompt) # will prompt you for new value
```

## Using `varlock encrypt` CLI

[Section titled “Using varlock encrypt CLI”](https://varlock.dev/guides/local-encryption/#using-varlock-encrypt-cli)

You can also call the [`varlock encrypt`](https://varlock.dev/reference/cli-commands/#encrypt) CLI command to get a secure prompt to encrypt a single value. It will spit out an item you can copy/paste into your file:

```
◇  Enter the value you want to encrypt│  ▪▪▪▪▪▪▪▪Copy this into your .env.local file and rename the key appropriately:SOME_SENSITIVE_KEY=varlock("local:ABC123...")
```

As outlined above, you can also run `varlock encrypt --file .env.local` to encrypt all sensitive plaintext values in a file in-place. This is a great way to quickly encrypt many secrets at once.

Use [`varlock encrypt`](https://varlock.dev/reference/cli-commands/#encrypt) to create encrypted payloads:

```
# Interactive: encrypt a single valuevarlock encrypt# Batch: encrypt all sensitive plaintext values in .env.localvarlock encrypt --file .env.local
```

Use [`varlock reveal`](https://varlock.dev/reference/cli-commands/#reveal) to inspect decrypted values safely:

```
varlock reveal                 # interactive - select and revealvarlock reveal API_KEY         # securely reveal specific itemvarlock reveal API_KEY --copy  # copy to clipboard
```

Use [`varlock lock`](https://varlock.dev/reference/cli-commands/#lock) to invalidate biometric session cache when stepping away:

```
varlock lock
```

## Backend selection overview

[Section titled “Backend selection overview”](https://varlock.dev/guides/local-encryption/#backend-selection-overview)

Varlock chooses the best available backend automatically:

|Platform|Backend|Key Storage|Biometric|
|---|---|---|---|
|macOS|Secure Enclave|Hardware Secure Enclave|Touch ID|
|Windows|DPAPI + Windows Hello|Windows credential store|Windows Hello (face/fingerprint/PIN)|
|Linux|TPM2 / Secret Service|TPM2 and/or system key store|Yes (when configured via polkit/PAM)|
|All platforms|File-based fallback|`~/.varlock/` directory|No|

If native capabilities are unavailable, varlock falls back to file-based local encryption.

## Platform details & setup

[Section titled “Platform details & setup”](https://varlock.dev/guides/local-encryption/#platform-details--setup)

-   Native Swift helper (Secure Enclave integration)
-   Uses system-native secure input / auth prompts
-   Includes a menu bar applet flow for native interactions
-   Hardware-backed key protection via Secure Enclave with biometric auth where supported

✅ No additional install/setup steps required

-   Native helper with DPAPI-based key protection
-   Windows native and WSL workflows are both supported
-   Automated daemon startup/installation behavior is built in for biometric session flows
-   WSL decrypt flows use a native bridge to the Windows daemon path
-   Biometric-capable session behavior where Windows Hello is available

✅ No additional install/setup steps required

-   Native Linux helper when available
-   User-presence verification via polkit/PAM (can support fingerprint/face/password depending system setup)

Common packages/tools:

-   `tpm2-tools` (plus distro TPM2 libs such as `tpm2-tss`)
-   `polkit` for user-presence authorization flows
-   `xclip` or `xsel` for `varlock reveal --copy`

Example installs:

```
# Debian/Ubuntusudo apt-get updatesudo apt-get install -y tpm2-tools tpm2-tss policykit-1 xclip
```

```
# Fedora/RHEL variantssudo dnf install -y tpm2-tools tpm2-tss polkit xclip
```

If biometric/user-presence prompts are unavailable on Linux, complete policy setup (native helper command):

```
sudo varlock-local-encrypt setup --linux-biometrics
```