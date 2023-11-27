import { Liveblocks } from "@liveblocks/node";

const API_KEY = import.meta.env.VITE_LIVEBLOCKS_SECRET_KEY as string;

const liveblocks = new Liveblocks({
  secret: API_KEY,
})

export async function post({ request }) {
  const { room } = await request.json();

  if (!API_KEY || !room) {
    return {
      status: 403,
    };
  }

  // For the avatar example, we're generating random users
  // and set their info from the authentication endpoint
  // See https://liveblocks.io/docs/api-reference/liveblocks-node#access-tokens for more information
  const user = {
    id: Math.random().toString(36).slice(-6),
    info: {
      name: "Guest",
      picture: `/assets/avatars/${Math.floor(Math.random() * 10)}.png`,
    },
  }

  const session = liveblocks.prepareSession(
    user.id,
    { userInfo: user.info }
  )

  session.allow(room, session.FULL_ACCESS)
  const { status, body } = await session.authorize()
  return { status, body };
}
