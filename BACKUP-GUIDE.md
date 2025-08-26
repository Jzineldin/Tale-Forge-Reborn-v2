# 🛡️ Tale Forge Backup & Recovery Guide

## 🚨 NEVER LOSE YOUR WORK AGAIN!

This guide ensures you'll never lose your project progress due to merge conflicts, accidental deletions, or other disasters.

## 🎯 Quick Start - Daily Workflow

### Every Time You Make Changes
```powershell
# Quick save your work (takes 5 seconds)
.\quick-save.ps1
# Or with a message
.\quick-save.ps1 "Added new feature"
```

### Before Major Changes or Merges
```powershell
# Create a full backup (takes 30 seconds)
.\backup-project.ps1
```

### If Something Goes Wrong
```powershell
# Restore from backup
.\restore-backup.ps1
```

## 📋 Your Backup System Overview

You now have **5 LAYERS OF PROTECTION**:

### 1. **GitHub Remote Backup** ☁️
- Every commit is saved to GitHub
- Backup branches are created automatically
- Can never be lost unless GitHub goes down

### 2. **Local Git Branches** 🌿
- Backup branches with timestamps
- Can switch between versions instantly
- Protected from accidental deletion

### 3. **ZIP Archives** 📁
- Complete project snapshots
- Stored in `D:\10_Projects\Sista Chansen\BACKUPS`
- Include all files except node_modules

### 4. **Directory Copies** 📂
- Full project copies with timestamps
- Can browse and copy individual files
- Quick manual recovery option

### 5. **Git Stash** 📦
- Temporary saves of work in progress
- Survives branch switches
- Perfect for experimental changes

## 🔧 Setup Instructions (One-Time)

### Step 1: Configure Git Safety
```powershell
.\setup-git-safety.ps1
```

This enables:
- Reflog (tracks ALL commits, even "deleted" ones)
- Auto-stashing on operations
- Protection against force pushes
- Conflict resolution memory
- Safety aliases

### Step 2: Test Your Backup System
```powershell
# Create a test backup
.\backup-project.ps1 "Test backup system"

# Check it worked
.\restore-backup.ps1
# Choose option 1 to see backup branches
```

## 💾 Backup Commands

### Quick Save (Use This Most!)
```powershell
.\quick-save.ps1                    # Default message
.\quick-save.ps1 "Fixed bug #123"   # Custom message
```
**When to use:** After every significant change (every 30 minutes)

### Full Backup
```powershell
.\backup-project.ps1                           # Default message
.\backup-project.ps1 "Before major refactor"   # Custom message
```
**When to use:** 
- Before merging branches
- Before major refactoring
- End of each day
- Before running risky commands

### Git Aliases (After running setup)
```bash
git save "message"    # Quick commit and push
git wip              # Save work in progress
git backup           # Create backup branch
git undo             # Undo last commit (keeps changes)
```

## 🔄 Recovery Scenarios

### Scenario 1: "I messed up a merge!"
```powershell
# Option 1: Restore from backup branch
.\restore-backup.ps1
# Choose option 2, select your backup

# Option 2: Undo the merge
git reset --hard HEAD~1

# Option 3: Use reflog to find good state
git reflog
git reset --hard HEAD@{n}  # where n is the good state
```

### Scenario 2: "I accidentally deleted files!"
```powershell
# If not committed yet
git checkout -- .

# If committed
git revert HEAD

# From backup
.\restore-backup.ps1
# Choose option 5 or 6 to browse backups
```

### Scenario 3: "My working directory is corrupted!"
```powershell
# Nuclear option - restore from ZIP
.\restore-backup.ps1
# Choose option 6, extract to new folder
# Copy the extracted files back to your project
```

### Scenario 4: "I need to see what I had yesterday"
```powershell
# List all backup branches
git branch -a | Select-String backup

# Checkout specific backup
git checkout backup/2024-01-15_14-30-00

# Or browse backup directory
explorer "D:\10_Projects\Sista Chansen\BACKUPS"
```

### Scenario 5: "I lost uncommitted changes"
```powershell
# Check stashes
git stash list

# Apply most recent stash
git stash apply

# Or use restore script
.\restore-backup.ps1
# Choose option 3 or 4
```

## 📊 Backup Schedule Recommendations

### Automated (via quick-save.ps1)
- **Every 30 minutes** during active development
- **Before coffee breaks** 
- **Before meetings**
- **Before switching tasks**

### Full Backup (via backup-project.ps1)
- **Daily** at end of work day
- **Before merges**
- **Before major refactors**
- **Before updating dependencies**
- **Before experimenting**

## 🚀 Pro Tips

### 1. Set Up a Reminder
Add to your Windows Task Scheduler to remind you to backup:
```powershell
# Run every 2 hours
schtasks /create /tn "TaleForgeBackup" /tr "powershell -WindowStyle Hidden -File 'D:\10_Projects\Sista Chansen\Tale-Forge-Reborn-v2\quick-save.ps1'" /sc hourly /mo 2
```

### 2. Check Your Backup Health
```powershell
# See how many backups you have
git branch -a | Select-String backup | Measure-Object

# Check backup directory size
Get-ChildItem "D:\10_Projects\Sista Chansen\BACKUPS" | Measure-Object -Sum Length
```

### 3. Clean Old Backups (Monthly)
```powershell
# List branches older than 30 days
git for-each-ref --format='%(refname:short) %(committerdate)' refs/heads/backup/ | Where-Object { $_ -match '(\d{4}-\d{2}-\d{2})' -and [DateTime]::Parse($Matches[1]) -lt (Get-Date).AddDays(-30) }

# Delete old backup branches (careful!)
git branch -d backup/old-branch-name
```

### 4. Emergency Recovery Kit
Keep these paths handy:
- **Backup Directory:** `D:\10_Projects\Sista Chansen\BACKUPS`
- **GitHub Repo:** `https://github.com/Jzineldin/Tale-Forge-Reborn-v2`
- **This Guide:** `BACKUP-GUIDE.md`

## 🔍 Verification Checklist

Run through this checklist to ensure your backups are working:

- [ ] Run `.\quick-save.ps1` - Should complete without errors
- [ ] Run `.\backup-project.ps1` - Should create 4 types of backups
- [ ] Check GitHub has your backup branches: `git branch -r | grep backup`
- [ ] Verify backup directory exists: `ls D:\10_Projects\Sista Chansen\BACKUPS`
- [ ] Test restore: `.\restore-backup.ps1` and choose option 1

## 🆘 If All Else Fails

1. **Check GitHub:** Your code is there in backup branches
2. **Check Backup Directory:** `D:\10_Projects\Sista Chansen\BACKUPS`
3. **Check Git Reflog:** `git reflog` shows ALL commits
4. **Check Stashes:** `git stash list`
5. **Contact Team:** Someone else may have a copy

## 💡 Remember

- **Commit early, commit often**
- **Push to GitHub frequently**
- **Run quick-save.ps1 obsessively**
- **Create full backups before anything risky**
- **Your work is now protected by 5 backup layers**

## 🎉 You're Protected!

With this system, losing work is virtually impossible. You have:
- ✅ Automatic GitHub backups
- ✅ Local branch backups  
- ✅ ZIP file archives
- ✅ Directory copies
- ✅ Git stash saves
- ✅ Reflog tracking everything

**Sleep well knowing your code is safe!** 😴💤