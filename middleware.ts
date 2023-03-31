// import { NextRequest, NextResponse } from "next/server";

// export const config = {
//   matcher: ["/", "/index"],
// };

// export function middleware(req: NextRequest) {
//   const basicAuth = req.headers.get("authorization");
//   const url = req.nextUrl;

//   if (basicAuth) {
//     const authValue = basicAuth.split(" ")[1];
//     const [user, pwd] = atob(authValue).split(":");

//     if (user === process.env.user && pwd === process.env.pwd) {
//       return NextResponse.next();
//     }
//   }
//   url.pathname = "/api/auth";

//   return NextResponse.rewrite(url);
// }

// middleware.ts
import { makeIPInspector } from "next-fortress/ip";

/*
  type IPs = string | Array<string>
  type makeIPInspector = (allowedIPs: IPs, fallback: Fallback) => Middleware
  // IP can be specified in CIDR format. You can also specify multiple IPs in an array.
*/
export const middleware = makeIPInspector("153.246.177.76", {
  type: "redirect",
  destination: "/error",
});

export const config = {
  matcher: ["/"],
};
