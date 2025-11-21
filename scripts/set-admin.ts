import { prisma } from "../lib/prisma";

async function setAdmin() {
  try {
    // Find user by display name "xSkyGuy17x"
    const user = await prisma.user.findFirst({
      where: { displayName: "xSkyGuy17x" },
    });

    if (!user) {
      console.error("❌ User 'SkyGuy' not found in database");
      console.log("\nAvailable users:");
      const allUsers = await prisma.user.findMany({
        select: { displayName: true, role: true, id: true },
      });
      allUsers.forEach((u) => {
        console.log(`  - ${u.displayName} (role: ${u.role}, id: ${u.id})`);
      });
      return;
    }

    console.log(`Found user: ${user.displayName} (${user.id})`);
    console.log(`Current role: ${user.role}`);

    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });

    console.log(`✅ User updated to admin role`);
    console.log(`New role: ${updatedUser.role}`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
