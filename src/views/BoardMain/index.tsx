import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { TablePagination, Box, Typography, IconButton, useTheme, List, ListItem, ListItemText, 
    TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, TableFooter, 
    Card, CardHeader, CardContent, CardActions, Button } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

import { fakerKO as faker } from "@faker-js/faker";

const DOMAIN = process.env.NEXT_PUBLIC_API_BACKEND_URL;

interface BoardItem {
    boardNumber: number;
    title: string;
    writerNickname: string;
    boardTitleImage: string;
    favoriteCount: number;
    commentCount: number;
    viewCount: number;
    writerProfileImage: string;
    writeDatetime: string;
}


interface BoardMainProps {
    token: string;
}

export default function BoardMain(props: BoardMainProps) {
    const { token } = props;
    const [boardResponse, setBoardResponse] = useState<any>('');
    console.log('token:' + token)
    const getBoard = async (token: string) => {
        const requestOption = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
    
        await axios.get(`${DOMAIN}/api/board/listPaging`, requestOption).then((response) => {
          setBoardResponse(response.data);
        }).catch((error) => '');
    }
    
    if (token) getBoard(token); // 로그인 처리
    else setBoardResponse('');  // 로그아웃 처리
    // "list" 필드의 값 추출
    const list = boardResponse.list;

    console.log('pagination:' + JSON.stringify(boardResponse)); // "list" 필드의 배열 값 출력

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
      ) => {
        console.log(newPage);
        
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
        
    

  return (
    <TableContainer component={Paper} sx={{ mt: '64px' }}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell align="right">title</TableCell>
                    <TableCell align="right">writerNickname</TableCell>
                    <TableCell align="right">boardTitleImage</TableCell>
                    <TableCell align="right">favoriteCount</TableCell>
                    <TableCell align="right">commentCount</TableCell>
                    <TableCell align="right">viewCount</TableCell>
                    <TableCell align="right">writerProfileImage</TableCell>
                    <TableCell align="right">writeDatetime</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {list
                    .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                    .map(({ boardNumber, title, writerNickname, boardTitleImage, favoriteCount, commentCount, viewCount, writerProfileImage, writeDatetime }: BoardItem, i: number) => (
                        <TableRow key={boardNumber}>
                            <TableCell component="th" scope="row">
                            {page * rowsPerPage + i + 1}
                            </TableCell>
                            <TableCell align="right">{title}</TableCell>
                            <TableCell align="right">{writerNickname}</TableCell>
                            <TableCell align="right">{boardTitleImage}</TableCell>
                            <TableCell align="right">{favoriteCount}</TableCell>
                            <TableCell align="right">{commentCount}</TableCell>
                            <TableCell align="right">{viewCount}</TableCell>
                            <TableCell align="right">{writerProfileImage}</TableCell>
                            <TableCell align="right">{writeDatetime}</TableCell>
                        </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TablePagination 
                        count={boardResponse.pagination.totalRecordCount}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableRow>
            </TableFooter> 
        </Table>
    </TableContainer>
  )
}
