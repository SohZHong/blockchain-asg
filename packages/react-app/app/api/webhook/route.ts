export const POST = async (req: Request) => {
  try {
    console.log('Webhook received');
    const body = req.json();
    console.log('event received', body);
    return new Response(JSON.stringify({ message: 'Webhook received' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ message: 'Webhook received' }), {
      status: 500,
    });
  }
};
