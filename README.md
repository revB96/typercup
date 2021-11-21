# typer-cup.pl
# TYPER-CUP.PL
Typer-cup is website project to placing bets on football matches. The project was created for Euro 2020, but I want to adapt it to other tournaments.

* [Project assumption](#project-assumption)
* [User menu and facilities](#user-menu-and-facilities)
* [Admin menu and facilities](#admin-menu-and-facilities)
* [TODO](#todo)

### Project assumption
1) General:
  - Tournament matches are divided into queues.
  - Users can placing bet on the current round until the queue in not closed
  - The queue is closed 1 hour befor first round match. Once the queue is closed, users cannot make changes to their bets.
  - As long as queue is open, users cannot view other users bets.
  - Points are updated after add result of the match by admin
    
2) Points:
  - 3 pt: Correct result
  - 1.5 pt: Win team 
  - 0.5 pt: Correct answer for quiz question
  - Points for the correct result and correct team, are not aggregated.
  - If several people have the same number of points, the points for the correct score points decide about position in table
  - If several people have the same number of point and correct scores, the correct team points decide about position in table 
  
3) Quiz:
  - Before the game begins, each user must complete a quiz about the upcoming tournament.
  - The quiz is closed by the admin before the tournament starts. Until then, users can make changes to their answers.
  - Points for the quiz are added after end of the tournament. Until this, point for the quiz are hidden
  - Users cannot view other users' answers before the tournament ends

## User menu and facilities
- [x] Dashboard: saving bets for the current queue, summary users bets after lock queues
![Dashboard](https://i.ibb.co/S5VKXHY/dashboard.png)
![Dashboard2](https://i.ibb.co/rFbqdjt/dashboard2.png)
- [x] Queues history
- [x] Table
![Table](https://i.ibb.co/y5gqMjJ/Zrzut-ekranu-2021-11-21-o-22-52-38.png)
- [x] Tournament table and stats
![Tournament table and stats](https://i.ibb.co/hgG5Lw8/euro.png)
- [x] Quiz
![Quiz](https://i.ibb.co/ByYX9DG/quiz.png)
- [x] Profile: reset password, notifications manager (TODO), user bets history
![Profile](https://i.ibb.co/5LLfpJX/Zrzut-ekranu-2021-11-21-o-22-56-48.png)

## Admin menu and facilities

- [x] Teams: Add new teams to database
![Teams](https://i.ibb.co/zVPCfjX/teams.png)
- [x] Schedule: Add new matchs in tournament
![Schedule](https://i.ibb.co/JttRfPR/schedule.png)
- [x] Scores: Add result of the matchs
![Scores](https://i.ibb.co/JRcRVZk/results.png)
- [x] Queues: Add new queues, control queues (start,lock,end)
![Queues](https://i.ibb.co/WfgRn7b/queues.png)
- [x] Users: Creating new user account. The logon details are sending by email.
![Users](https://i.ibb.co/x5h8xkh/users.png)
- [x] Quiz: Add questions and answers to the quiz, locking quiz (prohibit making changes in answers), add point for the quiz to the end results
![Quiz](https://i.ibb.co/tKbPRsL/quiz.png)
![Quiz2](https://i.ibb.co/n70Q1LJ/quiz2.png)
- [ ] Backup: creating database backups before and after each of the queue
![Backup](https://i.ibb.co/JR1yXRs/backup.png)

## TODO
- [ ] Project adaptation to play others tournament
- [ ] Add reset password by user
- [ ] Notifications system: new queue, queue summary, reminder about not sent bets
- [ ] Introduce new modes of playing tournaments

