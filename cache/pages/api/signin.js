// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (async (req, res) => {
  if(req.query.payload) {
    console.log(req.query.payload)
    res.json({ user_token: req.query.payload })
  } else {
    const signinRequest = await createSignInRequest((payload) => {
      console.log('createSignInRequest complete payload', payload)
    });
    console.log('signinRequest', signinRequest)
    res.json({ redirect: signinRequest.next.always })
  }
})