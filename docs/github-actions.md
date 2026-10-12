# GitHub Actions

Here’s the workflow with extra comments explaining both the YAML and the GitHub Actions concepts. This is just an example; I haven’t changed any files.

```yaml
# The workflow's display name in the GitHub Actions tab.
name: Tests

# "on" lists the GitHub events that start this workflow.
on:
  # Start a workflow run when someone pushes commits to the main branch.
  push:
    branches: [main]

  # Also start a run when a pull request is opened or updated.
  # With no branches listed, this applies to pull requests targeting any branch.
  pull_request:

# A workflow contains one or more jobs. Jobs run on GitHub-hosted machines
# (unless you configure your own runners).
jobs:
  # "test" is this job's ID; it helps identify the job in GitHub's UI.
  test:
    # GitHub creates a fresh Ubuntu virtual machine for this job run.
    runs-on: ubuntu-latest

    # Steps run in order on the same machine. If a step fails, later steps
    # normally won't run.
    steps:
      # "uses" runs a reusable action published for GitHub Actions.
      # This action checks out your repository so the following steps can
      # access its files.
      - uses: actions/checkout@v4

      # Set up Node.js using another reusable GitHub Action.
      - uses: actions/setup-node@v4
        with:
          # Use Node.js version 22 for the remaining steps in this job.
          node-version: 22

          # Cache npm's downloaded packages to speed up later workflow runs.
          # This caches package data, not your project's node_modules folder.
          cache: npm

      # "run" executes a shell command on the Ubuntu machine.
      # npm ci installs dependencies from the lockfile, which is suited to CI.
      - run: npm ci

      # Run the "test" script defined in your package.json.
      # A non-zero exit code marks this step, and therefore the job, as failed.
      - run: npm test
```

In short: GitHub watches for the listed events, starts a job on an Ubuntu machine, checks out your code, sets up Node.js, installs dependencies, and runs your tests. The result appears under the workflow run in the repository’s **Actions** tab.

## Q1 - What does the @v4 mean for your uses?

## Answer 1

### In `uses: actions/checkout@v4`, `@v4` selects **major version 4** of the `actions/checkout` action. It tells GitHub Actions which version of that reusable action to run.

The same applies to `actions/setup-node@v4`. The `v` means “version”; `4` is the major version. Pinning a major version generally allows compatible minor and patch updates within version 4, but not a jump to version 5.

## Q2 - Is that version 4 of the software?

## Answer 2

It’s version 4 of the **GitHub Action**, not version 4 of GitHub Actions itself or your project’s software.

For example, `actions/checkout@v4` means “use major version 4 of the `checkout` action.” Node.js is separately set to version 22 by `node-version: 22`.

## Q3 - How do you know what versions are available? Is there a list somewhere?

## Answer3

Yes. Check the action’s own GitHub repository, especially its **Releases** or **Tags** page. For example:

- [`actions/checkout` releases](https://github.com/actions/checkout/releases)
- [`actions/setup-node` releases](https://github.com/actions/setup-node/releases)

You can also browse actions in the [GitHub Marketplace](https://github.com/marketplace?type=actions), but the action’s repository is usually the clearest place to see its versions and change notes.

In `uses: owner/repository@ref`, the part after `@` is a reference: commonly a version tag such as `v4`, but it can also be a branch or a specific commit SHA. `@v4` selects the action’s major version 4; its maintainers generally update that tag with compatible v4 fixes and features.
