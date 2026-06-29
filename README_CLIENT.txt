ARABIC ADVENTURES - CLIENT SETUP GUIDE
=====================================

QUICK START (Recommended):
----------------------------
1. Place the project folder anywhere on your computer
2. Double-click on "run.bat" file
3. Wait for automatic setup and launch
4. Open browser at: http://127.0.0.1:3001

REQUIREMENTS:
------------
- Node.js installed from: https://nodejs.org
- pnpm installed (after Node.js): npm install -g pnpm

MANUAL SETUP (Advanced):
------------------------
1. Open command prompt in project folder
2. Run commands in order:
   • pnpm install
   • pnpm db:generate
   • pnpm db:migrate:deploy
   • pnpm db:seed
   • pnpm build
   • pnpm start -- --hostname 127.0.0.1 --port 3001

IMPORTANT NOTES:
---------------
• "run.bat" works automatically from any location
• App runs only on port 3001
• Keep command window open while using the app
• First run may take several minutes

TROUBLESHOOTING:
---------------
• Ensure Node.js and pnpm are properly installed
• Check that port 3001 is not used by other apps
• Restart computer if needed and try again

SUPPORT:
--------
• Email: [your-email@example.com]
• Phone: [your-phone-number]

Created: 29/06/2026
Version: 1.0
