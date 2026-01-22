export async function sendSlackAlert(text: string): Promise<Response> {
const webhookUrl = process.env.SLACK_WEBHOOK_URL;
if (!webhookUrl) {
console.warn("SLACK_WEBHOOK_URL not set, skipping Slack alert")
return new Response(null, { status: 200 })
}

return fetch(webhookUrl, {
method: "POST",
body: JSON.stringify({ text }),
headers: { "Content-Type": "application/json" }
})
}
