const queryTopContributors = async () => {
  try {
    const response = await fetch(
      "https://mee6.xyz/api/plugins/levels/leaderboard/1036357772826120242?page=0"
    );
    const result = await response.json();
    const transformedData = (result?.players ?? []).map(
      (player: any) => ({
        ...player,
        avatarUrl: `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.webp?size=128`
      })
    );

    return transformedData;
  } catch (error) {
    return [];
  }
}

export default queryTopContributors;
