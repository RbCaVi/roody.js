let token=process.env.DISCORD_TOKEN;
if (!token){
  token=fs.readFileSync('token',{'encoding':'utf-8'})
}
export {token}