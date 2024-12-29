// echo command

async function echo(text) {
  return text;
}

async function command(arg1) {
  return await echo(arg1);
}

export { command };
