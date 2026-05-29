% Simple nurse rostering with Day, Evening, Night, and Off shifts
include "regular.mzn";
enum NURSE;
enum DAY;
int: req_day;
int: req_evening;
int: req_night;
int: min_night;

enum SHIFT = { d, e, n, o };

enum STATE = { S1, S2, S3, S4, S5 };

array[STATE,SHIFT] of opt STATE: t =
      [|      d:   e:   n:   o:
       | S1:  S2,  S2,  S5,  S1   % Night shift moves to S5
       | S2:  S4,  S4,  S5,  S1   % Night shift moves to S5
       | S3:  S4,  S4,  S5,  S1   % Night shift moves to S5
       | S4:  S4,  S4,  S5,  S1   % State 4 now points to S5 on Night
       | S5:  <>,  <>,  <>,  S1   % S5: MUST be followed by 'o' (S1)
       |];

array[NURSE,DAY] of var SHIFT: roster;

constraint forall(j in DAY)(
             sum(i in NURSE)(roster[i,j] == d) == req_day /\
             sum(i in NURSE)(roster[i,j] == e) == req_evening /\
             sum(i in NURSE)(roster[i,j] == n) == req_night
           );
constraint forall(i in NURSE)(
             regular([roster[i,j] | j in DAY], t, S1, STATE) /\
             sum(j in DAY)(roster[i,j] == n) >= min_night
           );

solve satisfy;

NURSE = Nurse(1..7);
DAY = D(1..10);

req_day = 2;
req_evening = 2;
req_night = 2;
min_night = 2;
